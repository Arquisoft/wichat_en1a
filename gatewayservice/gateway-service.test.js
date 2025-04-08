const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service'); 

afterAll(async () => {
    app.close();
  });

jest.mock('axios');

const checkErrorResponse = async (url, expectedError, statusCode) => {
  const response = await request(app)
      .get(url)
      .expect('Content-Type', /json/)
      .expect(statusCode);

  expect(response.body.error).toBe(expectedError);
};

const checkSuccessResponse = async (url, mockData, expectedData) => {
  axios.get.mockResolvedValue({ data: mockData });

  const response = await request(app)
      .get(url)
      .expect('Content-Type', /json/)
      .expect(200);

  expect(response.body).toEqual(expectedData);
};

const checkPostSuccessResponse = async (url, requestData, mockData, expectedData) => {
  axios.post.mockResolvedValue({ data: mockData });

  const response = await request(app)
      .post(url)
      .send(requestData)
      .expect('Content-Type', /json/)
      .expect(200);

  expect(response.body).toEqual(expectedData);
};

const checkPutSuccessResponse = async (url, requestData, mockData, expectedData) => {
  axios.put.mockResolvedValue({ data: mockData });

  const response = await request(app)
      .put(url)
      .send(requestData)
      .expect('Content-Type', /json/)
      .expect(200);

  expect(response.body).toEqual(expectedData);
};


describe('Gateway Service', () => {
  axios.post.mockImplementation((url, data) => {
    if (url.endsWith('/user/login')) {
      return Promise.resolve({ data: { token: 'mockedToken' } });
    } else if (url.endsWith('/user/signup')) {
      return Promise.resolve({ data: { userId: 'mockedUserId' } });
    } else if (url.endsWith('/ask')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    }
  });

  it('should forward login request to auth service', async () => {
    await checkPostSuccessResponse('/api/user/login', { username: '', password: '' }, { token: 'mockedToken' }, { token: 'mockedToken' });
  });

  it('should forward add user request to user service', async () => {
    await checkPostSuccessResponse('/api/user/signup', { username: '', password: '' }, { userId: 'mockedUserId' }, { userId: 'mockedUserId' });
  });

  it('should forward askllm request to the llm service', async () => {
    await checkPostSuccessResponse('/api/askllm', { question: 'question', gameQuestion: 'gameQuestion', correctAnswer: 'llmanswer', model: 'empathy' }, { answer: 'llmanswer' }, { answer: 'llmanswer' });
  });

  it('should forward generate-questions request to the question service', async () => {
    const mockQuestions = [{ question: 'What is the flag of France?', answers: ['Blue', 'Red', 'White'], correctAnswer: 'Blue' }];
    await checkSuccessResponse('/api/generate-questions?type=flag&numQuestions=5', mockQuestions, mockQuestions);
  });

  it('should return error if type or numQuestions is missing or invalid', async () => {
    await checkErrorResponse('/api/generate-questions?type=&numQuestions=', 'Debe proporcionar un tipo de pregunta y un número válido de preguntas.', 400);
  });

  it('should return questions when the request is successful', async () => {
    const mockQuestions = [
      { questionText: 'Pregunta 1', options: ['a', 'b', 'c', 'd'], correctAnswer: 'a' },
      { questionText: 'Pregunta 2', options: ['a', 'b', 'c', 'd'], correctAnswer: 'b' }
    ];
    await checkSuccessResponse('/api/questions/type/5', mockQuestions, mockQuestions);
  });

  it('should return 500 if the question service fails', async () => {
    axios.get.mockRejectedValue(new Error('Error al obtener preguntas'));
    await checkErrorResponse('/api/questions/type/5', 'Error al obtener preguntas', 500);
  });

  it('should return a random question when the request is successful', async () => {
    const randomQuestion = { questionText: 'Pregunta aleatoria', options: ['a', 'b', 'c', 'd'], correctAnswer: 'c' };
    await checkSuccessResponse('/api/question', randomQuestion, randomQuestion);
  });

  it('should return 404 if no random question is found', async () => {
    axios.get.mockResolvedValue({ data: null });
    await checkErrorResponse('/api/question', 'No se encontró una pregunta', 404);
  });

  it('should return 500 if the question service fails', async () => {
    axios.get.mockRejectedValue(new Error('Error al obtener pregunta aleatoria'));
    await checkErrorResponse('/api/question', 'Error al obtener pregunta aleatoria', 500);
  });

  it('should return a random question when the request is successful', async () => {
    const randomQuestion = { questionText: 'Pregunta aleatoria', options: ['a', 'b', 'c', 'd'], correctAnswer: 'c' };
    await checkSuccessResponse('/api/question', randomQuestion, randomQuestion);
  });

  it('should return 404 if no random question is found', async () => {
    axios.get.mockResolvedValue({ data: null });
    await checkErrorResponse('/api/question', 'No se encontró una pregunta', 404);
  });

  it('should return 500 if the question service fails', async () => {
    axios.get.mockRejectedValue(new Error('Service Error'));
    await checkErrorResponse('/api/question', 'Service Error', 500);
  });
});


describe('Gateway Service - LLM Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  axios.post.mockImplementation((url, data) => {
    if (url.endsWith('/ask')) {
      return Promise.resolve({ data: { answer: 'The capital of France is Paris.' } });
    }
  });

  it('should forward ask request to llm service and filter the correct answer', async () => {
    const requestData = {
      question: 'What is the capital of France?',
      gameQuestion: 'Name the capital of France.',
      correctAnswer: 'Paris',
      apiKey: 'fake-api-key',
      model: 'gemini'
    };

    const response = await request(app)
        .post('/api/askllm')
        .send(requestData)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(response.body.answer).not.toContain('Paris'); // Asegura que la respuesta correcta no está en la respuesta final
    expect(response.body.answer).not.toBe(''); // Asegura que aún haya contenido
  });

  it('should return error if LLM service fails', async () => {
    axios.post.mockRejectedValue(new Error('LLM Service Error'));

    const response = await request(app)
        .post('/api/askllm')
        .send({
          question: 'Some question',
          gameQuestion: 'Some question text',
          correctAnswer: 'Some answer',
          apiKey: 'apiKey',
          model: 'gemini'
        })
        .expect('Content-Type', /json/)
        .expect(500);

    expect(response.body.error).toBe('Failed to process request to LLM Service');
  });

  it('Debe devolver 400 si faltan todos los parámetros', async () => {
    const response = await request(app).post('/api/askllm').send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields: question, gameQuestion, correctAnswer');
  });

  it('Debe devolver 400 si falta "question"', async () => {
    const response = await request(app).post('/api/askllm').send({
      gameQuestion: 'Pregunta del juego',
      correctAnswer: 'Respuesta correcta',
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields: question, gameQuestion, correctAnswer');

  });

  it('Debe devolver 400 si falta "gameQuestion"', async () => {
    const response = await request(app).post('/api/askllm').send({
      question: 'Pregunta de prueba',
      correctAnswer: 'Respuesta correcta',
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields: question, gameQuestion, correctAnswer');

  });

  it('Debe devolver 400 si falta "correctAnswer"', async () => {
    const response = await request(app).post('/api/askllm').send({
      question: 'Pregunta de prueba',
      gameQuestion: 'Pregunta del juego',
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields: question, gameQuestion, correctAnswer');

  });

});

describe('Gateway Service - Game Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should forward saveScore request to GameService', async () => {
    await checkPostSuccessResponse(
      '/api/saveScore',
      { userId: 'user1', score: 100, gameMode: 'expertDomain', questionsPassed : 13,questionsFailed : 7, accuracy :65 },
      { success: true },
      { success: true }
    );
  });

  it('should return 400 if saveScore is missing fields', async () => {
    const response = await request(app)
      .post('/api/saveScore')
      .send({})
      .expect(400);

    expect(response.body.error).toBe('Missing required fields');
  });

  it('should forward scoresByUser request to GameService', async () => {
    const mockScores = [{ userId: 'user1', score: 200, gameMode: 'expertDomain', questionsPassed : 11, questionsFailed: 9, accuracy :55 }];
    await checkSuccessResponse('/api/scoresByUser/user1', mockScores, mockScores);
  });

  it('should forward leaderboard request to GameService', async () => {
    const mockLeaderboard = [{ userId: 'user1', score: 500 }];
    await checkSuccessResponse('/api/leaderboard', mockLeaderboard, mockLeaderboard);
  });

  it('should return 500 if leaderboard request fails', async () => {
    axios.get.mockRejectedValue(new Error('Internal Server Error'));
    await checkErrorResponse('/api/leaderboard', 'Internal Server Error', 500);
  });

});

const checkHealthErrorResponse = async (url, expectedMessage, statusCode) => {
  const response = await request(app)
      .get(url)
      .expect('Content-Type', /json/)
      .expect(statusCode);

  expect(response.body.status).toBe('DOWN');
  expect(response.body.message).toBe(expectedMessage);
};

describe('Health Check Endpoints', () => {


  test('should return OK for /health', async () => {
    await checkSuccessResponse('/api/health', { status: 'OK' }, { status: 'OK' });
  });


  test('should return health status for userservice', async () => {
    await checkSuccessResponse('/api/userservice/health', { status: 'UP', service: 'User Service' }, { status: 'UP', service: 'User Service' });
  });


  test('should return health status for authservice', async () => {
    await checkSuccessResponse('/api/authservice/health', { status: 'UP', service: 'Auth Service' }, { status: 'UP', service: 'Auth Service' });
  });


  test('should return 500 for llmservice when down', async () => {
    axios.get.mockRejectedValue(new Error('LLM Service not available'));
    await checkHealthErrorResponse('/api/llmservice/health', 'LLM Service not available', 500);
  });


  test('should return health status for questionservice', async () => {
    await checkSuccessResponse('/api/questionservice/health', { status: 'UP', service: 'Question Service' }, { status: 'UP', service: 'Question Service' });
  });


  test('should return 500 for gameservice when down', async () => {
    axios.get.mockRejectedValue(new Error('Game Service not available'));
    await checkHealthErrorResponse('/api/gameservice/health', 'Game Service not available', 500);
  });
});
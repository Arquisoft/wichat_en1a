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

describe('Gateway Service', () => {
  axios.post.mockImplementation((url, data) => {
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'mockedToken' } });
    } else if (url.endsWith('/adduser')) {
      return Promise.resolve({ data: { userId: 'mockedUserId' } });
    } else if (url.endsWith('/ask')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    }
  });

  it('should forward login request to auth service', async () => {
    await checkPostSuccessResponse('/login', { username: 'testuser', password: 'testpassword' }, { token: 'mockedToken' }, { token: 'mockedToken' });
  });

  it('should forward add user request to user service', async () => {
    await checkPostSuccessResponse('/adduser', { username: 'newuser', password: 'newpassword' }, { userId: 'mockedUserId' }, { userId: 'mockedUserId' });
  });

  it('should forward askllm request to the llm service', async () => {
    await checkPostSuccessResponse('/askllm', { question: 'question', gameQuestion: 'gameQuestion', correctAnswer: 'llmanswer', apiKey: 'apiKey', model: 'empathy' }, { answer: 'llmanswer' }, { answer: 'llmanswer' });
  });

  it('should forward generate-questions request to the question service', async () => {
    const mockQuestions = [{ question: 'What is the flag of France?', answers: ['Blue', 'Red', 'White'], correctAnswer: 'Blue' }];
    await checkSuccessResponse('/generate-questions?type=flag&numQuestions=5', mockQuestions, mockQuestions);
  });

  it('should return error if type or numQuestions is missing or invalid', async () => {
    await checkErrorResponse('/generate-questions?type=&numQuestions=', 'Debe proporcionar un tipo de pregunta y un número válido de preguntas.', 400);
  });

  it('should return questions when the request is successful', async () => {
    const mockQuestions = [
      { questionText: 'Pregunta 1', options: ['a', 'b', 'c', 'd'], correctAnswer: 'a' },
      { questionText: 'Pregunta 2', options: ['a', 'b', 'c', 'd'], correctAnswer: 'b' }
    ];
    await checkSuccessResponse('/questions/type/5', mockQuestions, mockQuestions);
  });

  it('should return 500 if the question service fails', async () => {
    axios.get.mockRejectedValue(new Error('Error al obtener preguntas'));
    await checkErrorResponse('/questions/type/5', 'Error al obtener preguntas', 500);
  });

  it('should return a random question when the request is successful', async () => {
    const randomQuestion = { questionText: 'Pregunta aleatoria', options: ['a', 'b', 'c', 'd'], correctAnswer: 'c' };
    await checkSuccessResponse('/question', randomQuestion, randomQuestion);
  });

  it('should return 404 if no random question is found', async () => {
    axios.get.mockResolvedValue({ data: null });
    await checkErrorResponse('/question', 'No se encontró una pregunta', 404);
  });

  it('should return 500 if the question service fails', async () => {
    axios.get.mockRejectedValue(new Error('Error al obtener pregunta aleatoria'));
    await checkErrorResponse('/question', 'Error al obtener pregunta aleatoria', 500);
  });

  it('should return a random question when the request is successful', async () => {
    const randomQuestion = { questionText: 'Pregunta aleatoria', options: ['a', 'b', 'c', 'd'], correctAnswer: 'c' };
    await checkSuccessResponse('/question', randomQuestion, randomQuestion);
  });

  it('should return 404 if no random question is found', async () => {
    axios.get.mockResolvedValue({ data: null });
    await checkErrorResponse('/question', 'No se encontró una pregunta', 404);
  });

  it('should return 500 if the question service fails', async () => {
    axios.get.mockRejectedValue(new Error('Service Error'));
    await checkErrorResponse('/question', 'Service Error', 500);
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
        .post('/askllm')
        .send(requestData)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(response.body.answer).not.toContain('Paris'); // Asegura que la respuesta correcta no está en la respuesta final
    expect(response.body.answer).not.toBe(''); // Asegura que aún haya contenido
  });

  it('should return error if LLM service fails', async () => {
    axios.post.mockRejectedValue(new Error('LLM Service Error'));

    const response = await request(app)
        .post('/askllm')
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
    const response = await request(app).post('/askllm').send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields: question, gameQuestion, correctAnswer');
  });

  it('Debe devolver 400 si falta "question"', async () => {
    const response = await request(app).post('/askllm').send({
      gameQuestion: 'Pregunta del juego',
      correctAnswer: 'Respuesta correcta',
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields: question, gameQuestion, correctAnswer');

  });

  it('Debe devolver 400 si falta "gameQuestion"', async () => {
    const response = await request(app).post('/askllm').send({
      question: 'Pregunta de prueba',
      correctAnswer: 'Respuesta correcta',
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields: question, gameQuestion, correctAnswer');

  });

  it('Debe devolver 400 si falta "correctAnswer"', async () => {
    const response = await request(app).post('/askllm').send({
      question: 'Pregunta de prueba',
      gameQuestion: 'Pregunta del juego',
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields: question, gameQuestion, correctAnswer');

  });

});
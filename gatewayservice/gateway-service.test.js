const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service'); 

afterAll(async () => {
    app.close();
  });

jest.mock('axios');

describe('Gateway Service', () => {
  // Mock responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'mockedToken' } });
    } else if (url.endsWith('/adduser')) {
      return Promise.resolve({ data: { userId: 'mockedUserId' } });
    } else if (url.endsWith('/ask')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    }
  });

  // Test /login endpoint
  it('should forward login request to auth service', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBe('mockedToken');
  });

  // Test /adduser endpoint
  it('should forward add user request to user service', async () => {
    const response = await request(app)
      .post('/adduser')
      .send({ username: 'newuser', password: 'newpassword' });

    expect(response.statusCode).toBe(200);
    expect(response.body.userId).toBe('mockedUserId');
  });

  // Test /askllm endpoint
  it('should forward askllm request to the llm service', async () => {
    const response = await request(app)
      .post('/askllm')
      .send({ question: 'question', apiKey: 'apiKey', model: 'gemini' });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

  it('should forward generate-questions request to the question service', async () => {
    axios.get.mockResolvedValue({
      data: [{ question: 'What is the flag of France?', answers: ['Blue', 'Red', 'White'], correctAnswer: 'Blue' }],
    });

    // Hacemos la solicitud
    const response = await request(app)
        .get('/generate-questions')
        .query({ type: 'flag', numQuestions: 5 });

    // Verificamos el código de estado y el cuerpo de la respuesta
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { question: 'What is the flag of France?', answers: ['Blue', 'Red', 'White'], correctAnswer: 'Blue' },
    ]);


  });

  it('should return error if type or numQuestions is missing or invalid', async () => {
    const response = await request(app)
        .get('/generate-questions')
        .query({ type: '', numQuestions: '' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Debe proporcionar un tipo de pregunta y un número válido de preguntas.');
  });
});
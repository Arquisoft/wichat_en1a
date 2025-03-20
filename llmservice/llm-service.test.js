const request = require('supertest');
const axios = require('axios');
const app = require('./llm-service');

afterAll(async () => {
    app.close();
});

afterEach(() => {
    jest.clearAllMocks();
});

jest.mock('axios');

describe('LLM Service', () => {
  // Mock responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.startsWith('https://generativelanguage')) {
      return Promise.resolve({ data: { candidates: [{ content: { parts: [{ text: 'llmanswer' }] } }] } });
    } else if (url.startsWith('https://empathyai')) {
      return Promise.resolve({ data: { choices: [{ message: { content: 'llmanswer'} }]} });
    }
  });


  it('should return an answer from Gemini', async () => {
    const response = await request(app)
        .post('/ask')
        .send({
          question: 'What is the capital of France?',
          gameQuestion: 'Name the capital of France.',
          correctAnswer: 'Paris',
          apiKey: 'fake-api-key',
          model: 'gemini'
        });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

  it('should return an answer from EmpathyAI', async () => {
    const response = await request(app)
        .post('/ask')
        .send({
          question: 'Give me a hint about the Eiffel Tower.',
          gameQuestion: 'Where is the Eiffel Tower located?',
          correctAnswer: 'Paris',
          apiKey: 'fake-api-key',
          model: 'empathy'
        });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

  it('should return an error if required fields are missing', async () => {
    const response = await request(app)
        .post('/ask')
        .send({
          question: 'Incomplete request'
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('Missing required field');
  });

    it('should return an answer from Gemini without including the correct answer', async () => {
        const response = await request(app)
            .post('/ask')
            .send({
                question: 'What is the capital of France?',
                gameQuestion: 'Name the capital of France.',
                correctAnswer: 'Paris',
                apiKey: 'fake-api-key',
                model: 'gemini'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.answer).not.toContain('Paris');
        expect(response.body.answer).not.toBe('');
    });

    it('should return an answer from EmpathyAI without including the correct answer', async () => {
        const response = await request(app)
            .post('/ask')
            .send({
                question: 'Give me a hint about the Eiffel Tower.',
                gameQuestion: 'Where is the Eiffel Tower located?',
                correctAnswer: 'Paris',
                apiKey: 'fake-api-key',
                model: 'empathy'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.answer).not.toContain('Paris');
        expect(response.body.answer).not.toBe('');
    });
});
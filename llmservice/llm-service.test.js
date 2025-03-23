const request = require('supertest');
const axios = require('axios');
const app = require('./llm-service');

jest.mock('axios');

// Simulación de respuestas de los modelos LLM
axios.post.mockImplementation((url) => {
    if (url.includes('generativelanguage')) {
        return Promise.resolve({ data: { candidates: [{ content: { parts: [{ text: 'llmanswer' }] } }] } });
    } else if (url.includes('empathyai')) {
        return Promise.resolve({ data: { choices: [{ message: { content: 'llmanswer' } }] } });
    }
    return Promise.reject(new Error('API request failed'));
});

/**
 * Función auxiliar para probar solicitudes al LLM.
 */
const testLLMRequest = async (body) => request(app).post('/ask').send(body);

describe('LLM Service', () => {
    const validBody = {
        question: 'Give me a hint',
        gameQuestion: 'What is the capital of France?',
        correctAnswer: 'Paris',
        model: 'empathy',
        apiKey: 'fake-api-key'
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        app.close();
    });

    it.each([
        ['Gemini', 'gemini'],
        ['EmpathyAI', 'empathy']
    ])('should return an answer from %s', async (_, model) => {
        const response = await testLLMRequest({ ...validBody, model });

        expect(response.statusCode).toBe(200);
        expect(response.body.answer).toBe('llmanswer');
    });

    it.each([
        ['Gemini', 'gemini'],
        ['EmpathyAI', 'empathy']
    ])('should return an answer from %s without including the correct answer', async (_, model) => {
        const response = await testLLMRequest({
            ...validBody,
            model,
            question: 'Give me a hint about the Eiffel Tower.',
            gameQuestion: 'Where is the Eiffel Tower located?',
            correctAnswer: 'Paris'
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.answer).not.toContain('Paris');
        expect(response.body.answer).not.toBe('');
    });

    it('should return an error if required fields are missing', async () => {
        const response = await testLLMRequest({ question: 'Incomplete request' });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain('Missing required field');
    });

    it('should return an error for unsupported models', async () => {
        const response = await testLLMRequest({ ...validBody, model: 'unknownModel' });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toMatch(/Model "unknownModel" is not supported/i);
    });

    it('should handle API failures gracefully', async () => {
        axios.post.mockRejectedValueOnce(new Error('API request failed'));

        const response = await testLLMRequest(validBody);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toMatch('API request failed');
    });


});

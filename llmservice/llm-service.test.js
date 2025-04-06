const request = require('supertest');
const axios = require('axios');
//const app = require('./llm-service');
const { filterAnswer, server } = require('./llm-service');

jest.mock('axios');

axios.post.mockImplementation((url) => {
    if (url.includes('generativelanguage')) {
        return Promise.resolve({ data: { candidates: [{ content: { parts: [{ text: 'llmanswer' }] } }] } });
    } else if (url.includes('empathyai')) {
        return Promise.resolve({ data: { choices: [{ message: { content: 'llmanswer' } }] } });
    }
    return Promise.reject(new Error('API request failed'));
});


const testLLMRequest = async (body) => request(server).post('/ask').send(body);

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

describe('filterAnswer function', () => {
    const expectHintBlocked = (answer) => {
        expect(filterAnswer(answer, 'Paris')).toBe("[Hint Blocked: Try Again]");
    };

    it('should return "Could not generate a hint." when no answer is provided', () => {
        expect(filterAnswer(null, 'Paris')).toBe("Could not generate a hint.");
        expect(filterAnswer('', 'Paris')).toBe("Could not generate a hint.");
    });

    it('should block direct matches of the correct answer', () => {
        expectHintBlocked('Paris is the capital of France');
        expectHintBlocked('PARIS is the capital of France');
        expectHintBlocked('The capital of France is Paris');
    });

    it('should block common patterns revealing the answer', () => {
        const blockedPatterns = [
            'The answer is Paris',
            'Correct answer is Paris',
            'It is Paris',
        ];

        blockedPatterns.forEach(pattern => {
            expectHintBlocked(pattern); // Usamos la función auxiliar aquí también
        });
    });

    it('should return the original answer when it does not contain the correct answer or blocked patterns', () => {
        const result = filterAnswer('The Eiffel Tower is in Paris', 'London');
        expect(result).toBe('The Eiffel Tower is in Paris');

        const result2 = filterAnswer('The capital of France is beautiful', 'London');
        expect(result2).toBe('The capital of France is beautiful');
    });

});

afterAll(() => {
    server.close();
});

describe('Health Check Endpoints', () => {
    test('should return OK for /health', async () => {
        const response = await request(server).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('OK');
    });
});
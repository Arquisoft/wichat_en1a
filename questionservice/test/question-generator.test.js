// test/question-generator.test.js
const request = require('supertest');  // Asegúrate de que esta línea esté aquí
const express = require('express');
const router = require('../src/routes/question-routes');
const app = express();
const Question = require('../src/models/question-model');


app.use(express.json());
app.use(router);


jest.mock('../src/services/question-storage', () => ({
    saveQuestions: jest.fn(),
    addQuestion: jest.fn().mockResolvedValue({ _id: '123', question: 'What is 2 + 2?', answers: ['3', '4'], correctAnswerId: 1 }),
    getQuestions: jest.fn().mockResolvedValue([{ _id: '123', question: 'What is 2 + 2?', answers: ['3', '4'], correctAnswerId: 1 }]),
    getRandomQuestion: jest.fn().mockResolvedValue({ _id: '123', question: 'What is 2 + 2?', answers: ['3', '4'], correctAnswerId: 1 }),
    getQuestionById: jest.fn().mockResolvedValue({ _id: '123', question: 'What is 2 + 2?', answers: ['3', '4'], correctAnswerId: 1 }),
    checkAnswer: jest.fn().mockResolvedValue({ isCorrect: true }),
    clearQuestions: jest.fn().mockResolvedValue(),
    getQuestionsByType: jest.fn().mockResolvedValue([]),
}));

const { saveQuestions, addQuestion, getQuestions, getRandomQuestion, getQuestionById, checkAnswer, clearQuestions, getQuestionsByType} = require('../src/services/question-storage');

describe('Question Tests', () => {
    it('should add a question correctly', async () => {
        const questionData = { question: 'What is 2 + 2?', answers: ['3', '4'], correctAnswerId: 1 };

        const result = await addQuestion(questionData);
        expect(result).toEqual({ _id: '123', question: 'What is 2 + 2?', answers: ['3', '4'], correctAnswerId: 1 });
    });

    it('should return a random question', async () => {
        const question = await getRandomQuestion();
        expect(question).toEqual({ _id: '123', question: 'What is 2 + 2?', answers: ['3', '4'], correctAnswerId: 1 });
    });

    it('should get all questions', async () => {
        const questions = await getQuestions();
        expect(questions).toEqual([{ _id: '123', question: 'What is 2 + 2?', answers: ['3', '4'], correctAnswerId: 1 }]);
    });

    it('should get a question by ID', async () => {
        const question = await getQuestionById('123');
        expect(question).toEqual({ _id: '123', question: 'What is 2 + 2?', answers: ['3', '4'], correctAnswerId: 1 });
    });

    it('should check if the answer is correct', async () => {
        const result = await checkAnswer('123', '4');
        expect(result.isCorrect).toBe(true);
    });

    it('should clear all questions', async () => {
        await clearQuestions();
        expect(clearQuestions).toHaveBeenCalled();
    });
});






describe('Question Routes', () => {

    // Test 1: GET /questions - Genera preguntas
    it('should generate questions on GET /generateQuestions', async () => {
        const response = await request(app)
            .get('/generate-questions');  // Accedes a la ruta sin el prefijo /api
        expect(response.status).toBe(200);
        response.body.forEach(question => {
            expect(question).toHaveProperty('question');
            expect(question).toHaveProperty('answers');
            expect(Array.isArray(question.answers)).toBe(true);
            expect(question).toHaveProperty('correctAnswer');
            expect(question).toHaveProperty('correctAnswerId');
            expect(question).toHaveProperty('type');
        });
        expect(response.body.length).toBeGreaterThan(0);
    });

    // Test 2: GET /question - Obtiene una pregunta aleatoria
    it('should return a random question on GET /question', async () => {
        const mockQuestion = { question: "¿Cuál es la capital de Francia?", answers: ["París", "Roma"], correctAnswerId: 1, type: "multiple_choice" };
        getRandomQuestion.mockResolvedValue(mockQuestion);

        const response = await request(app)
            .get('/question');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockQuestion);
    });


    // Test 3: POST /check-answer - Verificar respuesta seleccionada
    it('should return 400 if questionId or selectedAnswer is missing on POST /check-answer', async () => {
        const response = await request(app)
            .post('/check-answer')
            .send({ questionId: 1 });  // Faltando selectedAnswer

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Faltan datos necesarios para verificar la respuesta');
    });

    it('should return 404 if the question does not exist on POST /check-answer', async () => {
        const questionId = 1;
        const selectedAnswer = 2;

        checkAnswer.mockResolvedValue(null);

        const response = await request(app)
            .post('/check-answer')
            .send({ questionId, selectedAnswer });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Pregunta no encontrada');
    });

    it('should return 200 if the answer is correct on POST /check-answer', async () => {
        const questionId = 1;
        const selectedAnswer = 2;

        checkAnswer.mockResolvedValue({ correct: true });

        const response = await request(app)
            .post('/check-answer')
            .send({ questionId, selectedAnswer });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('correct', true);  // Asegúrate de que la respuesta sea correcta
    });

    // Test 4: DELETE /questions - Limpiar todas las preguntas
    it('should delete all questions on DELETE /questions', async () => {
        clearQuestions.mockResolvedValue();

        const response = await request(app)
            .delete('/questions');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Todas las preguntas han sido eliminadas');
    });

    it('should return 200 and a success message when all questions are deleted', async () => {
        clearQuestions.mockResolvedValue();

        const response = await request(app)
            .delete('/questions');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Todas las preguntas han sido eliminadas');  // Verifica el mensaje
    });

    it('should return 500 if there is an error clearing questions', async () => {
        clearQuestions.mockRejectedValue(new Error('Error al limpiar las preguntas'));

        const response = await request(app)
            .delete('/questions');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error al limpiar las preguntas');
    });

    //TEST 6: GET question/id
    it('should return a question by id if found', async () => {
        const mockQuestion = {
            _id: '123456789',
            text: '¿Cuál es la capital de Francia?',
            answers: [
                { answer: 'Madrid', isCorrect: false },
                { answer: 'París', isCorrect: true },
                { answer: 'Berlín', isCorrect: false },
            ],
        };

        getQuestionById.mockResolvedValue(mockQuestion);

        const response = await request(app).get('/question/123456789');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id', '123456789');
        expect(response.body).toHaveProperty('text', '¿Cuál es la capital de Francia?');
        expect(response.body.answers).toHaveLength(3);
    });

    it('should return 404 if question is not found', async () => {
        getQuestionById.mockRejectedValue(new Error('Pregunta no encontrada'));

        const response = await request(app).get('/question/999');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Pregunta no encontrada');
    });

    it('should return questions of the given type', async () => {
        const mockQuestions = [
            { _id: '1', text: '¿Quién descubrió América?', type: 'historia', answers: [] },
            { _id: '2', text: '¿En qué año comenzó la Revolución Francesa?', type: 'historia', answers: [] }
        ];

        getQuestionsByType.mockResolvedValue(mockQuestions);

        const response = await request(app).get('/questions/type/historia');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toHaveProperty('text', '¿Quién descubrió América?');
        expect(response.body[1]).toHaveProperty('text', '¿En qué año comenzó la Revolución Francesa?');
    });

    it('should return an empty array if no questions are found', async () => {
        getQuestionsByType.mockResolvedValue([]);

        const response = await request(app).get('/questions/type/ciencia');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should return 500 if there is a database error', async () => {
        getQuestionsByType.mockRejectedValue(new Error('Error en la base de datos'));

        const response = await request(app).get('/questions/type/historia');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error en la base de datos');
    });
});
const {
    saveQuestions,
    addQuestion,
    getQuestions,
    getRandomQuestion,
    getQuestionById,
    checkAnswer,
    clearQuestions,
    getQuestionsByType
} = require('../src/services/question-storage');

jest.mock('../src/models/question-model', () => {
    return {
        Question: {
            exists: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            aggregate: jest.fn(),
            findById: jest.fn(),
            deleteMany: jest.fn(),
        }
    };
});

const { Question } = require('../src/models/question-model');

describe('question-storage', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('saveQuestions calls saveUniqueQuestion for each question', async () => {
        Question.exists.mockResolvedValue(false);
        Question.create.mockResolvedValue({});

        const questions = [
            { question: 'Q1', image: null },
            { question: 'Q2', image: 'img.jpg' }
        ];

        await saveQuestions(questions);

        expect(Question.create).toHaveBeenCalledTimes(2);
    });

    test('getQuestions returns list of questions', async () => {
        Question.find.mockResolvedValue([{ question: 'Q1' }, { question: 'Q2' }]);
        const result = await getQuestions();
        expect(result).toHaveLength(2);
    });

    test('getRandomQuestion returns a question', async () => {
        Question.aggregate.mockResolvedValue([{ question: 'Q' }]);
        const result = await getRandomQuestion();
        expect(result).toEqual({ question: 'Q' });
    });

    test('getRandomQuestion throws error if none found', async () => {
        Question.aggregate.mockResolvedValue([]);
        await expect(getRandomQuestion()).rejects.toThrow('Error al obtener una pregunta aleatoria');
    });

    test('getQuestionById returns question if found', async () => {
        Question.findById.mockResolvedValue({ _id: '123', question: 'Q' });
        const result = await getQuestionById('123');
        expect(result).toBeUndefined();
    });

    test('getQuestionById throws if not found', async () => {
        Question.findById.mockResolvedValue(null);
        await expect(getQuestionById('123')).rejects.toThrow('Error al obtener la pregunta');
    });

    test('checkAnswer returns true if correct', async () => {
        Question.findById.mockResolvedValue({
            answers: [
                { answer: 'A', isCorrect: false },
                { answer: 'B', isCorrect: true }
            ]
        });

        const result = await checkAnswer('id', 'B');
        expect(result.isCorrect).toBe(true);
    });

    test('checkAnswer returns false if incorrect', async () => {
        Question.findById.mockResolvedValue({
            answers: [
                { answer: 'A', isCorrect: false },
                { answer: 'B', isCorrect: true }
            ]
        });

        const result = await checkAnswer('id', 'A');
        expect(result.isCorrect).toBe(false);
    });

    test('checkAnswer throws if not found', async () => {
        Question.findById.mockResolvedValue(null);
        await expect(checkAnswer('id', 'A')).rejects.toThrow('Error al verificar la respuesta');
    });

    test('clearQuestions deletes all', async () => {
        await clearQuestions();
        expect(Question.deleteMany).toHaveBeenCalled();
    });

    test('getQuestionsByType with type all', async () => {
        Question.aggregate.mockResolvedValue([{ question: 'Q' }]);
        const result = await getQuestionsByType('all', 1);
        expect(result).toEqual([{ question: 'Q' }]);
    });
});



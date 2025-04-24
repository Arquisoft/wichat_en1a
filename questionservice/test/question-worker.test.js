const mongoose = require('mongoose');
const cron = require('node-cron');
const { generateQuestions } = require('../src/services/question-generator');

jest.mock('mongoose');
jest.mock('node-cron');
jest.mock('../src/services/question-generator');

describe('Question Worker', () => {

    const loadQuestionWorker = () => require('../src/services/question-worker');

    beforeAll(() => {
        mongoose.connect.mockResolvedValueOnce();
        generateQuestions.mockResolvedValueOnce();
    });

    it('should establish a connection to MongoDB', async () => {
        loadQuestionWorker();

        expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/questiondb', expect.any(Object));
    });

    it('should generate initial questions on start', async () => {
        loadQuestionWorker();

        expect(generateQuestions).toHaveBeenCalledWith('flag', 10);
        expect(generateQuestions).toHaveBeenCalledWith('city', 10);
    });

    it('should schedule the cron job every 10 minutes', async () => {
        loadQuestionWorker();

        cron.schedule.mockImplementationOnce((cronExpression, callback) => {
            callback();
        });

        await cron.schedule("*/10 * * * *", async () => {
            await generateQuestions("flag", 10);
            await generateQuestions("city", 10);
            await generateQuestions("flag", 10);
            await generateQuestions("city", 10);
        });

        expect(generateQuestions).toHaveBeenCalledTimes(4);
        expect(generateQuestions).toHaveBeenCalledWith('flag', 10);
        expect(generateQuestions).toHaveBeenCalledWith('city', 10);
    });

    it('should handle errors when generating questions', async () => {
        generateQuestions.mockRejectedValueOnce(new Error('Generation failed'));

        await expect(generateQuestions('flag', 10)).rejects.toThrow('Generation failed');
    });
});

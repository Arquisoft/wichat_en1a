const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Score = require('../models/score-model');
const User = require('../models/user-model');
const gameService = require('../services/game-service');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Game Service', () => {
    let user;

    beforeEach(async () => {
        await Score.deleteMany({});
        await User.deleteMany({});
        user = await User.create({ username: 'testuser', password: '123456' });
    });

    it('Should save a score successfully', async () => {
        const result = await gameService.saveScore(user._id, 10);
        expect(result.success).toBe(true);
        expect(result.newScore.score).toBe(10);
    });

    it('Should update an existing score', async () => {
        await gameService.saveScore(user._id, 5);
        const result = await gameService.updateScore(user._id, 15);
        expect(result.success).toBe(true);
        expect(result.updatedScore.score).toBe(15);
    });

    it('Should retrieve scores for a user', async () => {
        await gameService.saveScore(user._id, 20);
        const result = await gameService.getScoresByUser(user._id);
        expect(result.success).toBe(true);
        expect(result.scores.length).toBe(1);
    });

    it('Should return a sorted leaderboard', async () => {
        await gameService.saveScore(user._id, 50);
        const result = await gameService.getLeaderboard();
        expect(result.success).toBe(true);
        expect(result.leaderboard.length).toBe(1);
    });
});

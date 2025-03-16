const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user-model');
const Score = require('../models/score-model');

let mongoServer;
let userId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
    await Score.deleteMany({});
    await User.deleteMany({});
    const user = await User.create({ username: 'testuser', password: '123456' });
    userId = user._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Game Routes API', () => {
    it('Should save a score on /saveScore', async () => {
        const res = await request(app).post('/saveScore').send({ userId, score: 10 });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('Should update a score on /updateScore', async () => {
        await request(app).post('/saveScore').send({ userId, score: 5 });

        const res = await request(app).put('/updateScore').send({ userId, score: 20 });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.updatedScore.score).toBe(20);
    });

    it('Should return scores for a user on /scoresByUser/:userId', async () => {
        await request(app).post('/saveScore').send({ userId, score: 15 });

        const res = await request(app).get(`/scoresByUser/${userId}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.scores.length).toBeGreaterThan(0);
    });

    it('Should return a leaderboard on /leaderboard', async () => {
        await request(app).post('/saveScore').send({ userId, score: 50 });

        const res = await request(app).get('/leaderboard');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.leaderboard.length).toBeGreaterThan(0);
    });

    it('Should fail to save a score with missing data on /saveScore', async () => {
        const res = await request(app).post('/saveScore').send({ score: 10 }); // Missing userId

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

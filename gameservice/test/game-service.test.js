const request = require('supertest');
const express = require('express');
const gameRoutes = require('../src/routes/game-routes');

// Configuración de la app con Express y rutas
const app = express();
app.use(express.json());
app.use(gameRoutes);

jest.mock('../src/services/game-service', () => ({
    saveScore: jest.fn().mockResolvedValue({ success: true, newScore: { userId: 'user123', score: 100, gameMode: 'basicQuiz' } }),
    updateScore: jest.fn().mockResolvedValue({ success: true, updatedScore: { userId: 'user123', score: 200, gameMode: 'basicQuiz' } }),
    getScoresByUser: jest.fn().mockResolvedValue({
        success: true,
        scores: [
            { userId: 'user123', score: 100, gameMode: 'basicQuiz' },
            { userId: 'user123', score: 150, gameMode: 'expertDomain' }
        ]
    }),
    getLeaderboard: jest.fn().mockResolvedValue({
        success: true,
        leaderboard: [
            { userId: 'user1', score: 300, gameMode: 'basicQuiz' },
            { userId: 'user2', score: 250, gameMode: 'basicQuiz' },
            { userId: 'user3', score: 200, gameMode: 'basicQuiz' }
        ]
    }),
}));

const { saveScore, updateScore, getScoresByUser, getLeaderboard} = require('../src/services/game-service');

describe('Game Service Tests', () => {
    it('should save a score successfully', async () => {
        const result = await saveScore('user123',100,'basicQuiz');
        expect(result).toEqual({
            success: true,
            newScore: {
                userId: 'user123',
                score: 100,
                gameMode: 'basicQuiz'
            }
        });
    });

    it('should update an existing score', async () => {
        const result = await updateScore('user123', 200, 'basicQuiz');
        
        expect(result).toEqual({
            success: true,
            updatedScore: {
                userId: 'user123',
                score: 200,
                gameMode: 'basicQuiz'
            }
        });
    });

    it('should retrieve scores for a user', async () => {
        const result = await getScoresByUser('user123');

        expect(result).toEqual({
            success: true,
            scores: [
                { userId: 'user123', score: 100, gameMode: 'basicQuiz' },
                { userId: 'user123', score: 150, gameMode: 'expertDomain' }
            ]
        });
    });

    it('should return an error if no scores are found', async () => {
        getScoresByUser.mockResolvedValueOnce({ success: false, error: 'No scores found for this user' });

        const result = await getScoresByUser('user456'); // Usuario sin puntuaciones

        expect(result).toEqual({ success: false, error: 'No scores found for this user' });
    });

    it('should return a sorted leaderboard with game mode', async () => {
        const result = await getLeaderboard('basicQuiz');

        expect(result).toEqual({
            success: true,
            leaderboard: [
                { userId: 'user1', score: 300, gameMode: 'basicQuiz' },
                { userId: 'user2', score: 250, gameMode: 'basicQuiz' },
                { userId: 'user3', score: 200, gameMode: 'basicQuiz' }
            ]
        });

    });

    it('should handle leaderboard retrieval errors', async () => {
        getLeaderboard.mockResolvedValueOnce({ success: false, error: 'Error retrieving leaderboard' });

        const result = await getLeaderboard('basicQuiz');

        expect(result).toEqual({ success: false, error: 'Error retrieving leaderboard' });
    });

});

describe('Game Routes Tests', () => {
    
    it('POST /saveScore should save a score successfully', async () => {
        const res = await request(app)
            .post('/saveScore')
            .send({ userId: 'user123', score: 100, gameMode: 'basicQuiz' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            newScore: { userId: 'user123', score: 100, gameMode: 'basicQuiz' }
        });
    });

    it('POST /saveScore should return 400 if missing fields', async () => {
        const res = await request(app).post('/saveScore').send({ userId: 'user123' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ success: false, error: 'Missing required fields' });
    });

    it('PUT /updateScore should update an existing score', async () => {
        const res = await request(app)
            .put('/updateScore')
            .send({ userId: 'user123', score: 200, gameMode: 'basicQuiz' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            updatedScore: { userId: 'user123', score: 200, gameMode: 'basicQuiz' }
        });
    });

    it('PUT /updateScore should return 404 if score not found', async () => {
        updateScore.mockResolvedValueOnce({ success: false, error: 'Score not found' });

        const res = await request(app)
            .put('/updateScore')
            .send({ userId: 'user999', score: 300, gameMode: 'basicQuiz' });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ success: false, error: 'Score not found' });
    });

    it('GET /scoresByUser/:userId should retrieve scores for a user', async () => {
        const res = await request(app).get('/scoresByUser/user123');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            scores: [
                { userId: 'user123', score: 100, gameMode: 'basicQuiz' },
                { userId: 'user123', score: 150, gameMode: 'expertDomain' }
            ]
        });
    });

    it('GET /scoresByUser/:userId should return 404 if no scores found', async () => {
        getScoresByUser.mockResolvedValueOnce({ success: false, error: 'No scores found for this user' });

        const res = await request(app).get('/scoresByUser/user999');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ success: false, error: 'No scores found for this user' });
    });

    it('GET /leaderboard/:gameMode should return a sorted leaderboard', async () => {
        const res = await request(app).get('/leaderboard/basicQuiz');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            leaderboard: [
                { userId: 'user1', score: 300, gameMode: 'basicQuiz' },
                { userId: 'user2', score: 250, gameMode: 'basicQuiz' },
                { userId: 'user3', score: 200, gameMode: 'basicQuiz' }
            ]
        });
    });

    it('GET /leaderboard should return 500 on error', async () => {
        getLeaderboard.mockResolvedValueOnce({ success: false, error: 'Error retrieving leaderboard' });

        const res = await request(app).get('/leaderboard');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ success: false, error: 'No leaderboard data found' });
    });

});


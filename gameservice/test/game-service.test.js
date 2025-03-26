const request = require('supertest');
const express = require('express');
const gameRoutes = require('../src/routes/game-routes');

// Configuración de la app con Express y rutas
const app = express();
app.use(express.json());
app.use(gameRoutes);

jest.mock('../src/services/game-service', () => ({
    saveScore: jest.fn().mockResolvedValue({ success: true, newScore: { userId: 'user123', score: 100, gameMode: 'classic' } }),
    updateScore: jest.fn().mockResolvedValue({ success: true, updatedScore: { userId: 'user123', score: 200, gameMode: 'classic' } }),
    getScoresByUser: jest.fn().mockResolvedValue({
        success: true,
        scores: [
            { userId: 'user123', score: 100, gameMode: 'classic' },
            { userId: 'user123', score: 150, gameMode: 'arcade' }
        ]
    }),
    getLeaderboard: jest.fn().mockResolvedValue({
        success: true,
        leaderboard: [
            { userId: 'user1', score: 300, gameMode: 'classic' },
            { userId: 'user2', score: 250, gameMode: 'classic' },
            { userId: 'user3', score: 200, gameMode: 'classic' }
        ]
    }),
}));

const { saveScore, updateScore, getScoresByUser, getLeaderboard} = require('../src/services/game-service');

describe('Game Service Tests', () => {
    it('should save a score successfully', async () => {
        const result = await saveScore('user123',100,'classic');
        expect(result).toEqual({
            success: true,
            newScore: {
                userId: 'user123',
                score: 100,
                gameMode: 'classic'
            }
        });
    });

    it('should update an existing score', async () => {
        const result = await updateScore('user123', 200, 'classic');
        
        expect(result).toEqual({
            success: true,
            updatedScore: {
                userId: 'user123',
                score: 200,
                gameMode: 'classic'
            }
        });
    });

    it('should retrieve scores for a user', async () => {
        const result = await getScoresByUser('user123');

        expect(result).toEqual({
            success: true,
            scores: [
                { userId: 'user123', score: 100, gameMode: 'classic' },
                { userId: 'user123', score: 150, gameMode: 'arcade' }
            ]
        });
    });

    it('should return an error if no scores are found', async () => {
        getScoresByUser.mockResolvedValueOnce({ success: false, error: 'No scores found for this user' });

        const result = await getScoresByUser('user456'); // Usuario sin puntuaciones

        expect(result).toEqual({ success: false, error: 'No scores found for this user' });
    });

    it('should return a sorted leaderboard with game mode', async () => {
        const result = await getLeaderboard('classic');

        expect(result).toEqual({
            success: true,
            leaderboard: [
                { userId: 'user1', score: 300, gameMode: 'classic' },
                { userId: 'user2', score: 250, gameMode: 'classic' },
                { userId: 'user3', score: 200, gameMode: 'classic' }
            ]
        });

    });

    it('should handle leaderboard retrieval errors', async () => {
        getLeaderboard.mockResolvedValueOnce({ success: false, error: 'Error retrieving leaderboard' });

        const result = await getLeaderboard('classic');

        expect(result).toEqual({ success: false, error: 'Error retrieving leaderboard' });
    });

});

describe('Game Routes Tests', () => {
    
    it('POST /saveScore should save a score successfully', async () => {
        const res = await request(app)
            .post('/saveScore')
            .send({ userId: 'user123', score: 100, gameMode: 'classic' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            newScore: { userId: 'user123', score: 100, gameMode: 'classic' }
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
            .send({ userId: 'user123', score: 200, gameMode: 'classic' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            updatedScore: { userId: 'user123', score: 200, gameMode: 'classic' }
        });
    });

    it('PUT /updateScore should return 404 if score not found', async () => {
        updateScore.mockResolvedValueOnce({ success: false, error: 'Score not found' });

        const res = await request(app)
            .put('/updateScore')
            .send({ userId: 'user999', score: 300, gameMode: 'classic' });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ success: false, error: 'Score not found' });
    });

    it('GET /scoresByUser/:userId should retrieve scores for a user', async () => {
        const res = await request(app).get('/scoresByUser/user123');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            scores: [
                { userId: 'user123', score: 100, gameMode: 'classic' },
                { userId: 'user123', score: 150, gameMode: 'arcade' }
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
        const res = await request(app).get('/leaderboard/classic');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            leaderboard: [
                { userId: 'user1', score: 300, gameMode: 'classic' },
                { userId: 'user2', score: 250, gameMode: 'classic' },
                { userId: 'user3', score: 200, gameMode: 'classic' }
            ]
        });
    });

    it('GET /leaderboard should return 500 on error', async () => {
        getLeaderboard.mockResolvedValueOnce({ success: false, error: 'Error retrieving leaderboard' });

        const res = await request(app).get('/leaderboard');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ success: false, error: 'Error retrieving leaderboard' });
    });

});


const request = require('supertest');
const express = require('express');
const gameRoutes = require('../src/routes/game-routes');

// Configuración de la app con Express y rutas
const app = express();
app.use(express.json());
app.use(gameRoutes);

jest.mock('../src/services/game-service', () => ({
    saveScore: jest.fn().mockResolvedValue({ 
        success: true, 
        newScore: { 
            userId: 'user123', 
            score: 100, 
            gameMode: 'basicQuiz',
            questionsPassed: 18,
            questionsFailed: 2,
            accuracy: 80
        } 
    }),
    updateScore: jest.fn().mockResolvedValue({ 
        success: true, 
        updatedScore: { 
            userId: 'user123', 
            score: 200, 
            gameMode: 'basicQuiz',
            questionsPassed: 16,
            questionsFailed: 4,
            accuracy: 80
        } 
    }),
    getScoresByUser: jest.fn().mockResolvedValue({
        success: true,
        scores: [
            { userId: 'user123', score: 100, gameMode: 'basicQuiz', questionsPassed: 18, questionsFailed: 2, accuracy: 80 },
            { userId: 'user123', score: 150, gameMode: 'expertDomain', questionsPassed: 15, questionsFailed: 5, accuracy: 75 }
        ]
    }),
    getLeaderboard: jest.fn().mockResolvedValue({
        success: true,
        leaderboard: [
            { userId: 'user1', score: 300, gameMode: 'basicQuiz', accuracy: 90 },
            { userId: 'user2', score: 250, gameMode: 'basicQuiz', accuracy: 85 },
            { userId: 'user3', score: 200, gameMode: 'basicQuiz', accuracy: 80 }
        ]
    }),
}));

const { saveScore, updateScore, getScoresByUser, getLeaderboard } = require('../src/services/game-service');

describe('Game Service Tests', () => {
    it('should save a score successfully', async () => {
        const result = await saveScore('user123', 100, 'basicQuiz', 18, 80);
        expect(result).toEqual({
            success: true,
            newScore: {
                userId: 'user123',
                score: 100,
                gameMode: 'basicQuiz',
                questionsPassed: 18,
                questionsFailed: 2,
                accuracy: 80
            }
        });
    });

    it('should update an existing score', async () => {
        const result = await updateScore('user123', 200, 'basicQuiz', 16, 80);
        expect(result).toEqual({
            success: true,
            updatedScore: {
                userId: 'user123',
                score: 200,
                gameMode: 'basicQuiz',
                questionsPassed: 16,
                questionsFailed: 4,
                accuracy: 80
            }
        });
    });

    it('should retrieve scores for a user', async () => {
        const result = await getScoresByUser('user123');
        expect(result).toEqual({
            success: true,
            scores: [
                { userId: 'user123', score: 100, gameMode: 'basicQuiz', questionsPassed: 18, questionsFailed: 2, accuracy: 80 },
                { userId: 'user123', score: 150, gameMode: 'expertDomain', questionsPassed: 15, questionsFailed: 5, accuracy: 75 }
            ]
        });
    });

    it('should return a sorted leaderboard with accuracy included', async () => {
        const result = await getLeaderboard('basicQuiz');
        expect(result).toEqual({
            success: true,
            leaderboard: [
                { userId: 'user1', score: 300, gameMode: 'basicQuiz', accuracy: 90 },
                { userId: 'user2', score: 250, gameMode: 'basicQuiz', accuracy: 85 },
                { userId: 'user3', score: 200, gameMode: 'basicQuiz', accuracy: 80 }
            ]
        });
    });
});

describe('Game Routes Tests', () => {
    it('POST /saveScore should save a score successfully', async () => {
        const res = await request(app)
            .post('/saveScore')
            .send({ userId: 'user123', score: 100, gameMode: 'basicQuiz', questionsPassed: 18, accuracy: 80 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            newScore: { userId: 'user123', score: 100, gameMode: 'basicQuiz', questionsPassed: 18, questionsFailed: 2, accuracy: 80 }
        });
    });

    it('PUT /updateScore should update an existing score', async () => {
        const res = await request(app)
            .put('/updateScore')
            .send({ userId: 'user123', score: 200, gameMode: 'basicQuiz', questionsPassed: 16, accuracy: 80 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            updatedScore: { userId: 'user123', score: 200, gameMode: 'basicQuiz', questionsPassed: 16, questionsFailed: 4, accuracy: 80 }
        });
    });

    it('GET /scoresByUser/:userId should retrieve scores for a user', async () => {
        const res = await request(app).get('/scoresByUser/user123');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            scores: [
                { userId: 'user123', score: 100, gameMode: 'basicQuiz', questionsPassed: 18, questionsFailed: 2, accuracy: 80 },
                { userId: 'user123', score: 150, gameMode: 'expertDomain', questionsPassed: 15, questionsFailed: 5, accuracy: 75 }
            ]
        });
    });

    it('GET /leaderboard/:gameMode should return a sorted leaderboard with accuracy', async () => {
        const res = await request(app).get('/leaderboard/basicQuiz');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            leaderboard: [
                { userId: 'user1', score: 300, gameMode: 'basicQuiz', accuracy: 90 },
                { userId: 'user2', score: 250, gameMode: 'basicQuiz', accuracy: 85 },
                { userId: 'user3', score: 200, gameMode: 'basicQuiz', accuracy: 80 }
            ]
        });
    });
});

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
        ],
        totalGames: 2
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
        const result = await saveScore('user123', 100, 'basicQuiz', 18,2, 80);
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
        const result = await updateScore('user123', 200, 'basicQuiz', 16,4, 80);
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
            ],
            totalGames: 2
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

    it('should return an empty array if user has no scores', async () => {
        getScoresByUser.mockResolvedValueOnce({
            scores: [],
            totalGames: 0
        });

        const result = await getScoresByUser('userNotFound');
        expect(result).toEqual({
            scores: [],
            totalGames: 0
        });
    });

    it('should return an empty leaderboard if no scores are present', async () => {
        getLeaderboard.mockResolvedValueOnce({
            leaderboard: []
        });

        const result = await getLeaderboard('basicQuiz');
        expect(result).toEqual({
            leaderboard: []
        });
    });

    it('should handle an internal error when getting scores for a user', async () => {
        getScoresByUser.mockRejectedValueOnce(new Error('Internal Server Error'));

        try {
            await getScoresByUser('user123');
        } catch (error) {
            expect(error.message).toBe('Internal Server Error');
        }
    });
});

describe('Game Routes Tests', () => {
    it('POST /saveScore should save a score successfully', async () => {
        const res = await request(app)
            .post('/saveScore')
            .send({ userId: 'user123', score: 100, gameMode: 'basicQuiz', questionsPassed: 18, questionsFailed: 2, accuracy: 80 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            newScore: { userId: 'user123', score: 100, gameMode: 'basicQuiz', questionsPassed: 18, questionsFailed: 2, accuracy: 80 }
        });
    });

    it('POST /saveScore should return 400 if required fields are missing', async () => {
        const res = await request(app).post('/saveScore').send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Missing required fields');
    });

    it('POST /saveScore should return 500 on internal error', async () => {
        saveScore.mockImplementationOnce(() => {
            throw new Error('Something went wrong');
        });

        const res = await request(app)
            .post('/saveScore')
            .send({ userId: 'user123', score: 100, gameMode: 'basicQuiz', questionsPassed: 10, questionsFailed: 5, accuracy: 80 });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Error saving score');
    });

    it('POST /saveScore should return 400 if gameMode is invalid', async () => {
        const res = await request(app)
            .post('/saveScore')
            .send({ userId: 'user123', score: 100, gameMode: 'invalidMode', questionsPassed: 18, questionsFailed: 2, accuracy: 80 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid game mode');
    });

    it('POST /saveScore should return 500 if there is a database error', async () => {
        saveScore.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const res = await request(app)
            .post('/saveScore')
            .send({ userId: 'user123', score: 100, gameMode: 'basicQuiz', questionsPassed: 18, questionsFailed: 2, accuracy: 80 });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Error saving score');
    });


    it('PUT /updateScore should update an existing score', async () => {
        const res = await request(app)
            .put('/updateScore')
            .send({ userId: 'user123', score: 200, gameMode: 'basicQuiz', questionsPassed: 16,questionsFailed: 4, accuracy: 80 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            updatedScore: { userId: 'user123', score: 200, gameMode: 'basicQuiz', questionsPassed: 16, questionsFailed: 4, accuracy: 80 }
        });
    });

    it('PUT /updateScore should return 400 if required fields are missing', async () => {
        const res = await request(app)
            .put('/updateScore')
            .send({ userId: 'user123', score: 200 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Missing required fields');
    });

    it('PUT /updateScore should return 404 if score is not found', async () => {
        updateScore.mockResolvedValueOnce({ error: 'Score not found' });

        const res = await request(app)
            .put('/updateScore')
            .send({ userId: 'user123', score: 200, gameMode: 'basicQuiz', questionsPassed: 16, questionsFailed: 4, accuracy: 80 });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Score not found');
    });

    it('GET /scoresByUser/:userId should retrieve scores for a user', async () => {
        const res = await request(app).get('/scoresByUser/user123');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            scores: [
                { userId: 'user123', score: 100, gameMode: 'basicQuiz', questionsPassed: 18, questionsFailed: 2, accuracy: 80 },
                { userId: 'user123', score: 150, gameMode: 'expertDomain', questionsPassed: 15, questionsFailed: 5, accuracy: 75 }
            ],
            totalGames: 2
        });
    });

    it('GET /scoresByUser/:userId should return 404 if no scores found', async () => {
        getScoresByUser.mockResolvedValueOnce({ error: 'No scores found for this user' });

        const res = await request(app).get('/scoresByUser/unknownUser');

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('No scores found for this user');
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

    it('GET /leaderboard/:gameMode should return 404 if no leaderboard data', async () => {
        getLeaderboard.mockResolvedValueOnce({ error: 'No leaderboard data found' });

        const res = await request(app).get('/leaderboard/basicQuiz');

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('No leaderboard data found');
    });
});

describe('Health Check Endpoints', () => {
    test('should return OK for /health', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('OK');
    });
});

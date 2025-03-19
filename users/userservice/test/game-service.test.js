const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Score = require('../models/score-model');
const User = require('../models/user-model');
const gameService = require('../services/game-service');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
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
        // Guardar un puntaje
        const result = await gameService.saveScore(user._id, 10);

        // Verificar que el puntaje se guarda correctamente
        expect(result.success).toBe(true);
        expect(result.newScore.score).toBe(10);
        expect(result.newScore.userId.toString()).toBe(user._id.toString()); // Verificar que el puntaje pertenece al usuario correcto
    });

    it('Should update an existing score', async () => {
        // Guardar un puntaje inicial
        await gameService.saveScore(user._id, 5);

        // Actualizar el puntaje
        const result = await gameService.updateScore(user._id, 15);

        // Verificar que el puntaje fue actualizado
        expect(result.success).toBe(true);
        expect(result.updatedScore.score).toBe(15);
    });

    it('Should retrieve scores for a user', async () => {
        // Guardar un puntaje
        await gameService.saveScore(user._id, 20);

        // Obtener los puntajes del usuario
        const result = await gameService.getScoresByUser(user._id);

        // Verificar que el puntaje se recupera correctamente
        expect(result.success).toBe(true);
        expect(result.scores.length).toBe(1);
        expect(result.scores[0].score).toBe(20);
    });

    it('Should return a sorted leaderboard', async () => {
        // Guardar puntajes para varios usuarios
        const user2 = await User.create({ username: 'user2', password: '123456' });
        await gameService.saveScore(user._id, 50);
        await gameService.saveScore(user2._id, 100);

        // Obtener el leaderboard
        const result = await gameService.getLeaderboard();

        // Verificar que el leaderboard está correctamente ordenado
        expect(result.success).toBe(true);
        expect(result.leaderboard.length).toBe(2);
        expect(result.leaderboard[0].score).toBe(100); // El usuario con puntaje mayor debe estar primero
        expect(result.leaderboard[1].score).toBe(50);
    });
});

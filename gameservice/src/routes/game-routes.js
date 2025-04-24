require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { saveScore, updateScore, getScoresByUser, getLeaderboard } = require('../services/game-service');

// Middleware para verificar el JWT (incluso lo puedes poner aquí mismo)
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extrae el token del encabezado Authorization
    console.log('Token recibido:', token);
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar el token
        req.userId = decoded.userId;  // Guardar el userId decodificado en la solicitud
        next();  // Llamar al siguiente middleware o ruta
    } catch (err) {
        return res.status(401).json({ error: 'Expired or invalid token' });
    }
};

const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Guardar puntaje (requiere autenticación)
router.post('/saveScore', authenticateJWT, async (req, res) => {
    const { score, gameMode, questionsPassed, questionsFailed, accuracy } = req.body;
    const userId = req.userId;  // Obtener userId desde el token

    if (!score || gameMode == null || questionsPassed == null || questionsFailed == null || accuracy == null) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const validGameModes = ['basicQuiz','expertDomain','timeAttack','endlessMarathon'];
    if (!validGameModes.includes(gameMode)) {
        return res.status(400).json({ error: 'Invalid game mode' });
    }

    try {
        const result = await saveScore(userId, score, gameMode, questionsPassed, questionsFailed, accuracy);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error saving score' });
    }
});

// Actualizar puntaje (requiere autenticación)
router.put('/updateScore', authenticateJWT, async (req, res) => {
    const { score, gameMode, questionsPassed, questionsFailed, accuracy } = req.body;
    const userId = req.userId;  // Obtener userId desde el token

    if (!score || gameMode == null || questionsPassed == null || questionsFailed == null || accuracy == null) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await updateScore(userId, score, gameMode, questionsPassed, questionsFailed, accuracy);
        if (!result.updatedScore) {
            return res.status(404).json({ error: 'Score not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error updating score' });
    }
});

// Obtener puntajes por usuario (requiere autenticación)
router.get('/scoresByUser/:userId', authenticateJWT, async (req, res) => {
    const userId = req.params.userId; // Usamos el userId de los parámetros de la ruta
    const { gameMode } = req.query;

    try {
        const result = await getScoresByUser(userId, gameMode);
        if (!result.scores) {
            return res.status(404).json({ error: 'No scores found for this user' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving scores' });
    }
});

// Obtener el ranking (requiere autenticación)
router.get('/leaderboard/:gameMode?', async (req, res) => {
    let { gameMode } = req.params;
    if (!gameMode) gameMode = null;

    try {
        const result = await getLeaderboard(gameMode);
        if (!result.leaderboard) {
            return res.status(404).json({ error: 'No leaderboard data found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving leaderboard' });
    }
});

module.exports = router;

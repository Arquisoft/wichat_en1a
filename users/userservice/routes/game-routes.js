const express = require('express');
const { saveScore, updateScore, getScoresByUser, getLeaderboard } = require('../services/game-service');

const router = express.Router();

// 📌 Guardar un puntaje
router.post('/saveScore', async (req, res) => {
    const { userId, score } = req.body;
    const result = await saveScore(userId, score);
    res.status(result.success ? 200 : 400).json(result);
});

// 📌 Actualizar un puntaje
router.put('/updateScore', async (req, res) => {
    const { userId, score } = req.body;
    const result = await updateScore(userId, score);
    res.status(result.success ? 200 : 400).json(result);
});

// 📌 Obtener puntajes por usuario
router.get('/scoresByUser/:userId', async (req, res) => {
    const userId = req.params.userId;
    const result = await getScoresByUser(userId);
    res.status(result.success ? 200 : 404).json(result);
});

// 📌 Obtener el leaderboard (Top 10)
router.get('/leaderboard', async (req, res) => {
    const result = await getLeaderboard();
    res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;

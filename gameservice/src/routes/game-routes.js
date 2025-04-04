const express = require('express');
const { saveScore, updateScore, getScoresByUser, getLeaderboard } = require('../services/game-service');

const router = express.Router();

// Guardar puntaje
router.post('/saveScore', async (req, res) => {
    const { userId, score, gameMode, questionsPassed, accuracy } = req.body;

    if (!userId || typeof userId !== 'string' || score == null || !gameMode || questionsPassed == null || accuracy == null) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await saveScore(userId, score, gameMode, questionsPassed, accuracy);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error saving score' });
    }
});

// Actualizar puntaje
router.put('/updateScore', async (req, res) => {
    const { userId, score, gameMode, questionsPassed, accuracy } = req.body;

    if (!userId || score == null || !gameMode || questionsPassed == null || accuracy == null) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await updateScore(userId, score, gameMode, questionsPassed, accuracy);
        if (!result.updatedScore) {
            return res.status(404).json({ error: 'Score not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error updating score' });
    }
});

// Obtener puntajes por usuario
router.get('/scoresByUser/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { gameMode } = req.query;

    try {
        const result = await getScoresByUser(userId, gameMode);
        if (!result.scores || result.scores.length === 0) {
            return res.status(404).json({ error: 'No scores found for this user' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving scores' });
    }
});

// Obtener el ranking
router.get('/leaderboard/:gameMode?', async (req, res) => {
    let { gameMode } = req.params;
    if (!gameMode) gameMode = null;

    try {
        const result = await getLeaderboard(gameMode);
        if (!result.leaderboard || result.leaderboard.length === 0) {
            return res.status(404).json({ error: 'No leaderboard data found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving leaderboard' });
    }
});

module.exports = router;

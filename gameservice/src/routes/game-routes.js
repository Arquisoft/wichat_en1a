const express = require('express');
const { saveScore, updateScore, getScoresByUser, getLeaderboard } = require('../services/game-service');

const router = express.Router();

// Guardar puntaje
router.post('/saveScore', async (req, res) => {
    const { userId, score, gameMode } = req.body;

    if (!userId || typeof userId !== 'string' || score == null || !gameMode) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const result = await saveScore(userId, score, gameMode);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error saving score' });
    }
});

// Actualizar puntaje
router.put('/updateScore', async (req, res) => {
    const { userId, score, gameMode } = req.body;

    if (!userId || score == null || !gameMode) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const result = await updateScore(userId, score, gameMode);
        if (!result || result.success === false) {
            return res.status(404).json({ success: false, error: 'Score not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error updating score' });
    }
});

// Obtener puntajes por usuario
router.get('/scoresByUser/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { gameMode } = req.query;

    try {
        const result = await getScoresByUser(userId, gameMode);
        if (!result || !result.scores || result.scores.length === 0) {
            return res.status(404).json({ success: false, error: 'No scores found for this user' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error retrieving scores' });
    }
});

// Obtener el ranking
router.get('/leaderboard/:gameMode?', async (req, res) => {
    let { gameMode } = req.params;
    if (!gameMode) gameMode = null;

    try {
        const result = await getLeaderboard(gameMode);
        if (!result || !result.leaderboard || result.leaderboard.length === 0) {
            return res.status(500).json({ success: false, error: 'No leaderboard data found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error retrieving leaderboard' });
    }
});

module.exports = router;

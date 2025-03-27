const express = require('express');
const { saveScore, updateScore, getScoresByUser, getLeaderboard } = require('../services/game-service');

const router = express.Router();

router.post('/saveScore', async (req, res) => {
    const { userId, score, gameMode } = req.body;

    if (!userId || typeof userId !== 'string' || !score || !gameMode) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await saveScore(userId, score, gameMode);
    res.status(result.success ? 200 : 400).json(result);
});

router.put('/updateScore', async (req, res) => {
    const { userId, score, gameMode } = req.body;
    if (!userId || score == null || !gameMode) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await updateScore(userId, score, gameMode);
    res.status(result.success ? 200 : 404).json(result);
});

router.get('/scoresByUser/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { gameMode } = req.query;  
    const result = await getScoresByUser(userId, gameMode);
    res.status(result.success ? 200 : 404).json(result);
});

router.get('/leaderboard/:gameMode?', async (req, res) => {
    let { gameMode } = req.params;
    if (!gameMode) gameMode = null;

    const result = await getLeaderboard(gameMode);
    res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;

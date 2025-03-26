const mongoose = require('mongoose');
const Score = require('../models/score-model');  

const saveScore = async (userId, score, gameMode) => {
    if (!userId || score == null || !gameMode) {
        return { success: false, error: 'Missing required fields' };
    }
    try {
        const newScore = new Score({ userId, score, gameMode });
        await newScore.save();
        return { success: true, newScore };
    } catch (error) {
        return { success: false, error: `Error saving score: ${error.message}` };
    }
};

const updateScore = async (userId, score, gameMode) => {
    if (!userId || score == null || !gameMode) {
        return { success: false, error: 'Invalid data' };
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, error: 'Invalid userId format' };
    }

    try {
        const updatedScore = await Score.findOneAndUpdate(
            { userId: userId, gameMode },  
            { $set: { score } },
            { new: true }
        );

        if (!updatedScore) return { success: false, error: 'Score not found' };
        return { success: true, updatedScore };
    } catch (error) {
        return { success: false, error: `Error updating score: ${error.message}` };
    }
};

const getScoresByUser = async (userId, gameMode) => {
    try {
        const query = gameMode ? { userId, gameMode } : { userId };
        const scores = await Score.find(query);

        if (!scores || !scores.length) {
            return { success: false, error: 'No scores found for this user' };
        }

        return { success: true, scores };
    } catch (error) {
        return { success: false, error: `Error retrieving scores: ${error.message}` };
    }
};

const getLeaderboard = async (gameMode) => {
    try {
        const query = gameMode ? { gameMode } : {};  
        const leaderboard = await Score.find(query)
            .sort({ score: -1 })  
            .limit(10);

        return { success: true, leaderboard };
    } catch (error) {
        return { success: false, error: `Error retrieving leaderboard: ${error.message}` };
    }
};

module.exports = { saveScore, updateScore, getScoresByUser, getLeaderboard };

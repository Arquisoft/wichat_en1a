const Score = require('../models/score-model');

/**
 * 📌 Saves a user's score.
 * @param {string} userId - User ID.
 * @param {number} score - Score achieved.
 */
const saveScore = async (userId, score) => {
    try {
        const newScore = new Score({ userId, score });
        await newScore.save();
        return { success: true, newScore };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * 📌 Updates a user's score.
 * @param {string} userId - User ID.
 * @param {number} score - New score.
 */
const updateScore = async (userId, score) => {
    if (!userId || score == null) return { success: false, error: 'Invalid data' };

    try {
        const updatedScore = await Score.findOneAndUpdate(
            { userId },
            { $set: { score } },
            { new: true }
        );

        if (!updatedScore) return { success: false, error: 'Score not found' };
        return { success: true, updatedScore };
    } catch (error) {
        return { success: false, error: 'Error updating score' };
    }
};

/**
 * 📌 Retrieves a user's scores.
 * @param {string} userId - User ID.
 */
const getScoresByUser = async (userId) => {
    try {
        const scores = await Score.find({ userId });
        if (!scores.length) return { success: false, error: 'No scores found for this user' };
        return { success: true, scores };
    } catch (error) {
        return { success: false, error: 'Error retrieving scores' };
    }
};

/**
 * 📌 Retrieves the leaderboard (Top 10 players with the highest scores).
 */
const getLeaderboard = async () => {
    try {
        const leaderboard = await Score.find()
            .populate('userId', 'username')
            .sort({ score: -1 })
            .limit(10);

        return { success: true, leaderboard };
    } catch (error) {
        return { success: false, error: 'Error retrieving leaderboard' };
    }
};

module.exports = { saveScore, updateScore, getScoresByUser, getLeaderboard };

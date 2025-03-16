const mongoose = require('mongoose');
const Score = require('../models/score-model'); // Solo una vez

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
        return { success: false, error: `Error saving score: ${error.message}` };
    }
};

/**
 * 📌 Updates a user's score.
 * @param {string} userId - User ID.
 * @param {number} score - New score.
 */
const updateScore = async (userId, score) => {
    if (!userId || score == null) return { success: false, error: 'Invalid data' };


    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, error: 'Invalid userId format' };
    }

    try {
        const updatedScore = await Score.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId(userId) },
            { $set: { score } },
            { new: true }
        );

        if (!updatedScore) return { success: false, error: 'Score not found' };
        return { success: true, updatedScore };
    } catch (error) {
        return { success: false, error: `Error updating score: ${error.message}` };
    }
};

/**
 * 📌 Retrieves a user's scores.
 * @param {string} userId - User ID.
 */
const getScoresByUser = async (userId) => {
    try {
        const scores = await Score.find({ userId });

        if (!scores || !scores.length) {
            return { success: false, error: 'No scores found for this user' };
        }

        return { success: true, scores };
    } catch (error) {
        return { success: false, error: `Error retrieving scores: ${error.message}` };
    }
};

/**
 * 📌 Retrieves the leaderboard (Top 10 players with the highest scores).
 */
const getLeaderboard = async () => {
    try {
        const leaderboard = await Score.find()
            .populate('userId', 'username')  // Asegúrate de que el usuario esté poblado correctamente
            .sort({ score: -1 })  // Ordenar por puntaje en orden descendente
            .limit(10);

        return { success: true, leaderboard };
    } catch (error) {
        return { success: false, error: `Error retrieving leaderboard: ${error.message}` };
    }
};

module.exports = { saveScore, updateScore, getScoresByUser, getLeaderboard };

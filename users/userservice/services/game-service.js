const Score = require('../models/score-model');

/**
 * 📌 Guarda el puntaje de un usuario.
 * @param {string} userId - ID del usuario.
 * @param {number} score - Puntaje obtenido.
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
 * 📌 Actualiza el puntaje de un usuario.
 * @param {string} userId - ID del usuario.
 * @param {number} score - Nuevo puntaje.
 */
const updateScore = async (userId, score) => {
    if (!userId || score == null) return { success: false, error: 'Datos inválidos' };

    try {
        const updatedScore = await Score.findOneAndUpdate(
            { userId },
            { $set: { score } },
            { new: true }
        );

        if (!updatedScore) return { success: false, error: 'Puntaje no encontrado' };
        return { success: true, updatedScore };
    } catch (error) {
        return { success: false, error: 'Error al actualizar el puntaje' };
    }
};

/**
 * 📌 Obtiene los puntajes de un usuario.
 * @param {string} userId - ID del usuario.
 */
const getScoresByUser = async (userId) => {
    try {
        const scores = await Score.find({ userId });
        if (!scores.length) return { success: false, error: 'No hay puntajes para este usuario' };
        return { success: true, scores };
    } catch (error) {
        return { success: false, error: 'Error al obtener los puntajes' };
    }
};

/**
 * 📌 Obtiene el leaderboard (Top 10 jugadores con más puntuación).
 */
const getLeaderboard = async () => {
    try {
        const leaderboard = await Score.find()
            .populate('userId', 'username')
            .sort({ score: -1 })
            .limit(10);

        return { success: true, leaderboard };
    } catch (error) {
        return { success: false, error: 'Error al obtener el leaderboard' };
    }
};

module.exports = { saveScore, updateScore, getScoresByUser, getLeaderboard };

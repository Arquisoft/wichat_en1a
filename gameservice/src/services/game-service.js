const mongoose = require('mongoose');
const Score = require('../models/score-model');

const saveScore = async (userId, score, gameMode, questionsPassed,questionsFailed, accuracy) => {
    if (!userId || score == null || !gameMode || questionsPassed == null || questionsFailed == null || accuracy == null) {
        return { error: 'Missing required fields' };
    }

    try {
        const newScore = new Score({
            userId,
            score,
            gameMode,
            questionsPassed,
            questionsFailed,
            accuracy
        });

        await newScore.save();
        return { newScore };
    } catch (error) {
        return { error: `Error saving score: ${error.message}` };
    }
};


const updateScore = async (userId, score, gameMode, questionsPassed,questionsFailed, accuracy) => {
    if (!userId || score == null || !gameMode || questionsPassed == null || questionsFailed == null || accuracy == null) {
        return { error: 'Invalid data' };
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { error: 'Invalid userId format' };
    }

    try {
        const existingScore = await Score.findOne({ userId, gameMode });

        if (!existingScore) {
            return { error: 'Score not found' };
        }

        const updatedQuestionsPassed = existingScore.questionsPassed + questionsPassed;
        const updatedQuestionsFailed = existingScore.questionsFailed + questionsFailed;
        const updatedAccuracy = existingScore.accuracy + accuracy;

        const updatedScore = await Score.findOneAndUpdate(
            { userId, gameMode },
            {
                $set: { score, accuracy: updatedAccuracy },
                $inc: { questionsPassed, questionsFailed }
            },
            { new: true }
        );

        return { updatedScore };
    } catch (error) {
        return { error: `Error updating score: ${error.message}` };
    }
};

const getScoresByUser = async (userId, gameMode) => {
    try {
        const query = gameMode ? { userId, gameMode } : { userId };
        const scores = await Score.find(query);

        if (!scores || !scores.length) {
            return { error: 'No scores found for this user' };
        }

        return { scores, totalGames: scores.length };
    } catch (error) {
        return { error: `Error retrieving scores: ${error.message}` };
    }
};

const getLeaderboard = async (gameMode) => {
    try {
        const query = gameMode ? { gameMode } : {};
        const leaderboard = await Score.find(query)
            .sort({ score: -1 })  
            .limit(10);

        return { leaderboard };
    } catch (error) {
        return { error: `Error retrieving leaderboard: ${error.message}` };
    }
};

module.exports = { saveScore, updateScore, getScoresByUser, getLeaderboard };

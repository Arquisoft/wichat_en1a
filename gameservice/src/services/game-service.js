const mongoose = require('mongoose');
const Score = require('../models/score-model');
const validator = require('validator');


const saveScore = async (userId, score, gameMode, questionsPassed,questionsFailed, accuracy, meanTimeToAnswer) => {
    if (!userId || score == null || !gameMode || questionsPassed == null || questionsFailed == null || accuracy == null || meanTimeToAnswer == null) {
        return { error: 'Missing required fields' };
    }

    try {
        const newScore = new Score({
            userId,
            score,
            gameMode,
            questionsPassed,
            questionsFailed,
            accuracy,
            meanTimeToAnswer
        });

        await newScore.save();
        return { newScore };
    } catch (error) {
        return { error: `Error saving score: ${error.message}` };
    }
};


const updateScore = async (userId, score, gameMode, questionsPassed, questionsFailed, accuracy) => {
    const allowedGameModes = ['basicQuiz', 'expertDomain', 'timeAttack', 'endlessMarathon', 'custom'];

    if (
        !userId ||
        score == null ||
        !gameMode ||
        questionsPassed == null ||
        questionsFailed == null ||
        accuracy == null
    ) {
        return { error: 'Invalid data' };
    }

    const escapedUserId = validator.escape(userId.toString()); // userId como string
    const escapedGameMode = validator.escape(gameMode.toString()); // gameMode también escapado

    if (!allowedGameModes.includes(escapedGameMode)) {
        return { error: 'Invalid game mode' };
    }

    if (
        typeof score !== 'number' ||
        typeof questionsPassed !== 'number' ||
        typeof questionsFailed !== 'number' ||
        typeof accuracy !== 'number'
    ) {
        return { error: 'Invalid data types for score details' };
    }

    try {
        const query = {
            userId: escapedUserId,
            gameMode: escapedGameMode
        };

        const existingScore = await Score.findOne(query);
        if (!existingScore) {
            return { error: 'Score not found' };
        }

        const updatedAccuracy = existingScore.accuracy + accuracy;

        const updatedScore = await Score.findOneAndUpdate(
            query,
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
        const escapedUserId = validator.escape(userId.toString());

        const allowedGameModes = ['basicQuiz', 'expertDomain', 'timeAttack', 'endlessMarathon', 'custom'];
        const escapedGameMode = gameMode ? validator.escape(gameMode.toString()) : null;

        const isValidGameMode = escapedGameMode && allowedGameModes.includes(escapedGameMode);


        const query = {
            userId: escapedUserId
        };

        if (isValidGameMode) {
            query.gameMode = escapedGameMode;
        }

        const scores = await Score.find(query).sort({ createdAt: -1 });

        if (!scores?.length) {
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

        return { leaderboard : leaderboard || []};
    } catch (error) {
        return { error: `Error retrieving leaderboard: ${error.message}` };
    }
};

module.exports = { saveScore, updateScore, getScoresByUser, getLeaderboard };

const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    userId: {
        type: String, 
        required: true
    },
    score: {
        type: Number,
        default: 0,
    },
    gameMode: {
        type: String,
        enum: ['basicQuiz','expertDomain','timeAttack','endlessMarathon'], 
        required: true,
    },
    questionsPassed: {
        type: Number,
        default: 0,
    },
    questionsFailed: {
        type: Number,
        default: 0,
    },
    accuracy: {
        type: Number,
        default: 0, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Crear el modelo Score
const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;

const mongoose = require('mongoose');

const User = require('../../../users/userservice/user-model');

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
        enum: ['classic','timed'], 
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: false,
    },
});

// Crear el modelo Score
const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;

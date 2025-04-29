const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoserver;
let userservice;
let questionservice;
let questionworker;
let gameservice;
let authservice;
let llmservice;
let gatewayservice;

async function startServer() {
    console.log('Starting MongoDB memory server...');
    mongoserver = await MongoMemoryServer.create();
    const mongoUri = mongoserver.getUri();
    process.env.MONGODB_URI = mongoUri;
    userservice = await require("../../users/userservice/src/index");
    questionservice = await require("../../questionservice/src/index");
    questionworker = await require("../../questionservice/src/services/question-worker");
    gameservice = await require("../../gameservice/src/index");
    authservice = await require("../../users/authservice/src/index");
    llmservice = await require("../../llmservice/src/index");
    gatewayservice = await require("../../gatewayservice/src/index");
}

startServer();

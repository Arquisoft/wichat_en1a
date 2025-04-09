const cron = require("node-cron");
const { generateQuestions } = require("../services/question-generator");
const mongoose = require('mongoose');
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';


mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log("Conection stablished with MongoDB");

    // Generate questions at the beginning
    console.log("Generating initial questions...");
    try {
        await generateQuestions("flag", 10);
        await generateQuestions("city", 10);
        await generateQuestions("celebrity", 10);
        console.log("Initial questions generated successfully.");
    } catch (error) {
        console.error("Error at generating the initial questions:", error);
    }
}).catch((err) => {
    console.error("Error connecting MongoDB:", err);
});

// Generate question every 10 minutes
cron.schedule("*/1 * * * *", async () => {
    console.log("Generating new questions...");
    try {
        await generateQuestions("flag",10);
        await generateQuestions("city",10);
        await generateQuestions("celebrity", 10);
        console.log("Questions generated successfully.");
    } catch (error) {
        console.error("Error at generating questions:", error);
    }
});

console.log("Cron job for generating questions initialized.");

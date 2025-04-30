const cron = require("node-cron");
const { generateQuestions } = require("../services/question-generator");
const mongoose = require('mongoose');
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log("Connection established with MongoDB");

    // Initialize offsets for each question type
    let offsetValues = {
        flag: 0,
        city: 0,
        celebrity: 0,
        science: 0,
        sport: 0,
    };

    let executionCount = 0;

    // Generate questions at the beginning
    console.log("Generating initial questions...");
    try {
        await generateQuestions("flag", 10, offsetValues.flag);
        await generateQuestions("city", 10, offsetValues.city);
        await generateQuestions("celebrity", 10, offsetValues.celebrity);
        await generateQuestions("science", 10, offsetValues.science);
        await generateQuestions("sport", 10, offsetValues.sport);

        offsetValues.flag += 10;
        offsetValues.city += 10;
        offsetValues.celebrity += 10;
        offsetValues.science += 10;
        offsetValues.sport += 10;
        executionCount++;


        console.log("Initial questions generated successfully.");
    } catch (error) {
        console.error("Error at generating the initial questions:", error);
    }

    // Generate questions every 10 minutes
    cron.schedule("*/10 * * * *", async () => {
        console.log("Generating new questions...");
        try {
            await generateQuestions("flag", 10, offsetValues.flag);
            offsetValues.flag += 10;

            await generateQuestions("city", 10, offsetValues.city);
            offsetValues.city += 10;

            await generateQuestions("celebrity", 10, offsetValues.celebrity);
            offsetValues.celebrity += 10;

            await generateQuestions("science", 10, offsetValues.science);
            offsetValues.science += 10;

            await generateQuestions("sport", 10, offsetValues.sport);
            offsetValues.sport += 10;

            console.log("Questions generated successfully.");

            executionCount++;

            if (executionCount >= 8) {
                console.log("Resetting offsets after 10 executions...");
                offsetValues = {
                    flag: 0,
                    city: 0,
                    celebrity: 0,
                    science: 0,
                    sport: 0,
                };
                executionCount = 0;
            }
        } catch (error) {
            console.error("Error at generating questions:", error);
        }
    });

    console.log("Cron job for generating questions initialized.");
}).catch((err) => {
    console.error("Error connecting MongoDB:", err);
});


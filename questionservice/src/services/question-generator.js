const axios = require('axios');
const { saveQuestions } = require('./question-storage');


const questionConfigs = {
    flag: {
        entity: '?entity wdt:P31 wd:Q186516', // Country
        fields: '?entity ?entityLabel ?image',
        conditions: '?entity rdfs:label ?entityLabel.\n' +
            '            ?entity wdt:P18 ?image.\n' +
            '            FILTER(LANG(?entityLabel) = "es").', // Flag image
        questionTemplate: '¿De qué país es esta bandera?',
        correctAnswerField: 'entityLabel',
        imageField: 'image'
    },

    city: {
        entity: '?entity wdt:P31 wd:Q515',
        fields: '?entity ?entityLabel ?image',
        conditions: `
        ?entity rdfs:label ?entityLabel.
        ?entity wdt:P18 ?image.  
        FILTER(LANG(?entityLabel) = "es").
    `,
        questionTemplate: '¿Qué ciudad es esta?',
        correctAnswerField: 'entityLabel',
        imageField: 'image'
    }


};


const generateSparqlQuery = (type, limit) => {
    const config = questionConfigs[type];
    if (!config) throw new Error(`Unsupported question type: ${type}`);

    return `
         SELECT ${config.fields} WHERE {
            ${config.entity}.
            ${config.conditions}
        }
        LIMIT ${limit}
    `;
};


const fetchWikidata = async (query) => {
    try {
        const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
        const response = await axios.get(url);
        return response.data.results.bindings;
    } catch (error) {
        throw new Error('Error fetching data from Wikidata: ' + error.message);
    }
};


const generateQuestionsFromData = (data, type) => {
    const config = questionConfigs[type];
    if (!config) throw new Error(`Unsupported question type: ${type}`);

    return data.map((item) => {
        const correctAnswer = item[config.correctAnswerField].value;
        const incorrectOptions = generateIncorrectOptions(correctAnswer, data, 3);

         // Combina la respuesta correcta con las incorrectas y mezcla las opciones
         const allOptions = [correctAnswer, ...incorrectOptions];
         const shuffledOptions = shuffleArray(allOptions);

        return {
            question: config.questionTemplate,
            image: config.imageField ? item[config.imageField]?.value : null,
            correctAnswer,
            correctAnswerId: shuffledOptions.indexOf(correctAnswer),
            type,
            answers: [correctAnswer, ...incorrectOptions]
        };
    });
};


const generateIncorrectOptions = (correctAnswer, data, numOptions) => {
    const incorrectOptions = [];
    const labels = data.map((item) => item.entityLabel?.value );

    while (incorrectOptions.length < numOptions) {
        const randomLabel = labels[Math.floor(Math.random() * labels.length)];
        if (randomLabel !== correctAnswer && !incorrectOptions.includes(randomLabel)) {
            incorrectOptions.push(randomLabel);
        }
    }

    return incorrectOptions;
};


const generateQuestions = async (type = 'city', numQuestions = 10) => {
    try {
        const query = generateSparqlQuery(type, numQuestions);
        const data = await fetchWikidata(query);

        if (data.length === 0) {
            throw new Error('No data found in Wikidata');
        }

        const questions = generateQuestionsFromData(data, type);
        await saveQuestions(questions);
        return questions;
    } catch (error) {
        throw new Error('Error generating questions: ' + error.message);
    }
};

module.exports = { generateQuestions, generateSparqlQuery, fetchWikidata, generateQuestionsFromData, generateIncorrectOptions };

const axios = require('axios');
const { saveQuestions } = require('./question-storage');


const questionConfigs = {
    flag: {
        entity: '?entity wdt:P31 wd:Q186516', // Country
        fields: '?entity ?entityLabel ?image',
        conditions: '?entity rdfs:label ?entityLabel.\n' +
            '            ?entity wdt:P18 ?image.\n' +
            '            FILTER(LANG(?entityLabel) = "en").', // Flag image
        questionTemplate: 'What country\'s flag is this?',
        correctAnswerField: 'entityLabel',
        imageField: 'image',
        orderBy: ''
    },

    city: {
        entity: '?entity wdt:P31 wd:Q515',
        fields: '?entity ?entityLabel ?image',
        conditions: `
        ?entity rdfs:label ?entityLabel.
        ?entity wdt:P18 ?image.  
        FILTER(LANG(?entityLabel) = "en").
    `,
        questionTemplate: 'What city is this?',
        correctAnswerField: 'entityLabel',
        imageField: 'image',
        orderBy: ''
    },
    celebrity: {
        entity: '?entity wdt:P106 wd:Q33999',
        fields: '?entity ?entityLabel ?image',
        conditions: '?entity rdfs:label ?entityLabel.\n' +
            '?entity wdt:P18 ?image.\n' +
            'FILTER(LANG(?entityLabel) = "en").',
        questionTemplate: 'Who is this celebrity?',
        correctAnswerField: 'entityLabel',
        imageField: 'image',
        orderBy: ''
    },

    science: {
        entity: '?entity wdt:P106 wd:Q901',
        fields: '?entity ?entityLabel ?image',
        conditions: '?entity rdfs:label ?entityLabel.\n' +
            '?entity wdt:P18 ?image.\n' +
            'FILTER(LANG(?entityLabel) = "en").',
        questionTemplate: 'What scientist is this?',
        correctAnswerField: 'entityLabel',
        imageField: 'image',
        orderBy: ''
    },

    sport: {
        entity: '?entity wdt:P31 wd:Q31629',
        fields: '?entity ?entityLabel ?image',
        conditions: `
        ?entity wikibase:sitelinks ?sitelinks;
               wdt:P18 ?image.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    `,
        questionTemplate: 'What sport is shown in the image?',
        correctAnswerField: 'entityLabel',
        imageField: 'image',
        orderBy: 'ORDER BY DESC(?sitelinks)'
    }




};


const generateSparqlQuery = (type, limit, offset = 0) => {
    const config = questionConfigs[type];
    if (!config) throw new Error(`Unsupported question type: ${type}`);

    return `
         SELECT ${config.fields} WHERE {
            ${config.entity}.
            ${config.conditions}
        }
        ${config.orderBy}
        LIMIT ${limit}
        OFFSET ${offset}
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
            answers: shuffledOptions
        };
    });
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];  // Intercambio de elementos
    }
    return array;
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


const generateQuestions = async (type = 'city', numQuestions = 10, offset = 0) => {
    try {
        const query = generateSparqlQuery(type, numQuestions, offset);
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

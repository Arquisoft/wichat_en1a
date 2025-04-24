const llmConfigs = {
    gemini: {
        url: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        transformRequest: (question) => ({
            contents: [{ parts: [{ text: question }] }]
        }),
        transformResponse: (response) => response.data.candidates[0]?.content?.parts[0]?.text
    },
    empathy: {
        url: () => 'https://empathyai.prod.empathy.co/v1/chat/completions',
        transformRequest: (question) => ({
            model: "qwen/Qwen2.5-Coder-7B-Instruct",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: question }
            ]
        }),
        transformResponse: (response) => response.data.choices[0]?.message?.content,
        headers: (apiKey) => ({
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        })
    }
};

module.exports = llmConfigs;

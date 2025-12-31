const OpenAI = require('openai');
require('dotenv').config()

const client = new OpenAI({
    apiKey: process.env.OPEN_API_KEY
});

const configOpenAI = async ({model, messages }) =>{
    const response = await client.responses.create({
    model: model,
    input: messages
});
return response.output_text;
}


module.exports = configOpenAI;
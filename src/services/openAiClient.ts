import OpenAI from "openai"

const OpenAiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export default OpenAiClient;
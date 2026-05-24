import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME || 'qwen-coder-turbo',
  apiKey: process.env.OPENAPI_API_KEY,
  configuration: {
    baseURL: process.env.BASE_URL,
  }
});

const response = await model.invoke('介绍下自己');

console.log(response)
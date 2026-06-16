import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.BASE_URL,
  },
});

const schema = z.object({
  translation: z.string().describe("翻译后的英文文本"),
  keywords: z.array(z.string()).length(3).describe("3个关键字"),
});

const outputParser = StructuredOutputParser.fromZodSchema(schema);

const promptTemplate = PromptTemplate.fromTemplate(
  "将以下文本翻译成英文，然后总结为3个关键词。\n\n文本：{text}\n\n{format_instructions}",
);

const input = {
  text: "LangChain 是一个强大的 AI 应用开发框架",
  format_instructions: outputParser.getFormatInstructions(),
};

// 步骤1: 格式化 Prompt
const formattedPrompt = await promptTemplate.format(input);

// 步骤2: 调用模型
const response = await model.invoke(formattedPrompt);

// 步骤3: 解析出结果
const result = await outputParser.invoke(response);

console.log("✅ 最终结果:");
console.log(result);

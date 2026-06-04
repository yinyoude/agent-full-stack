import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputToolsParser } from "@langchain/core/output_parsers/openai_tools";
import { z } from 'zod';

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.BASE_URL,
  },
});

// 定义结构化输出的 schema
const scientistSchema = z.object({
  name: z.string().describe("科学家的全名"),
  birth_year: z.number().describe("出生年份"),
  death_year: z.number().optional().describe("去世年份，如果还在世则不填"),
  nationality: z.string().describe("国籍"),
  fields: z.array(z.string()).describe("研究领域列表"),
  achievements: z.array(z.string()).describe("主要成就"),
  biography: z.string().describe("简短传记"),
});

const modelWithTools = model.bindTools([
  {
    name: "extract_scientist_info",
    description: "提取和结构化科学家的详细信息",
    schema: scientistSchema,
  },
]);

// 1.绑定工具并挂在解析器
const parser = new JsonOutputToolsParser();
const chain = modelWithTools.pipe(parser);

try {
  // 2.开启流
  const stream = await chain.stream("详细介绍牛顿的生平和成就");

  let lastContent = ''; // 记录已打印的完整内容
  let finalResult = null; // 存储最终的完整结果

  console.log("📡 实时输出流式内容:\n");

  for await (const chunk of stream) {
    if (chunk.length > 0) {
      const toolCall = chunk[0];

      // 获取当前工具调用的完整参数内容
      // ps 下面这段代码有问题：这里的逻辑实际上输出的是增量的数据，但是对现在这个 case 而言，增量的数据并不是末尾的数据，可能是
      // 中间的字段，所以不能准确输出
      // const currentContent = JSON.stringify(toolCall.args || {}, null, 2);

      // if (currentContent.length > lastContent.length) {
      //   const newText = currentContent.slice(lastContent.length);
      //   process.stdout.write(newText); // 实时输出到控制台
      //   lastContent = currentContent; // 更新已读进度
      // }

      console.log(toolCall.args)
    }
  }
} catch (error) {
  console.error(error.message)
}
import { ChatOpenAI } from "@langchain/openai";
import { tool } from '@langchain/core/tools';
import { SystemMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import fs from 'node:fs/promises';
import { z } from 'zod';

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME || 'qwen-coder-turbo',
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.BASE_URL,
  }
})

const readFileTool = tool(
  async ({ filePath }) => {
    const content = await fs.readFile(filePath, 'utf-8');
    console.log(` 【工具调用】 read_file("${filePath}") - 成功读取 ${content.length} 字节`)
    return `文件内容：\n${content}`;
  },
  {
    name: 'read_file',
    description: '此工具用来读取文件内容。当用户要求读取文件、查看代码、分析文件内容时，调用此工具。输入参数为一个字符串，表示文件路径，可以是相对路径或绝对路径，例如 "src/index.js"。输出为文件内容的字符串。',
    schema: z.object({
      filePath: z.string().describe('要读取的文件路径')
    })
  }
);

const tools = [
  readFileTool
];

const modelWithTools = model.bindTools(tools);

const messages = [
  new SystemMessage(`你是一个代码助手，可以使用工具读取文件并解析代码

    工作流程：
    1. 用户要求读取文件时，立即调用 read_file 工具
    2. 等待工具返回文件内容
    3. 基于文件内容进行分析和解释

    可用工具：
    - read_file: 读取文件内容（使用此工具来获取文件内容）
  `),
  new HumanMessage('请读取 src/tool-file-read.mjs 文件内容并解释代码')
];

let response = await modelWithTools.invoke(messages);

// console.log(response);

messages.push(response);

// 为什么 while？不会死循环吗？
// 这个是大模型决定的，当大模型认为不需要再执行 tool 的时候，tool_calls 会返回 undefined，结合这个文件读取的例子
// 大模型第一次读取，读取后发现内容不全，就需要再次读取，这时候就会再次调用 tool，直到大模型认为已经读取到足够的信息了，就不会再调用 tool 了，这时候 tool_calls 就会返回 undefined，while 循环就结束了
while (response.tool_calls && response.tool_calls.length > 0) {
  console.log(`\n[检测到 ${response.tool_calls.length} 个工具调用]`);

  // 执行所有工具调用
  // Promise.all 是必须的吗？不是的，这个是按照逻辑决定的，如果你觉得这里应该是没有关系的批量读取，可以这么写
  // 如果你觉得应该是有先后关系的逐个读取，那就不能用 Promise.all 了，必须要等上一个工具调用完成后再进行下一个工具调用了，这个是根据实际情况来决定的
  const toolResults = await Promise.all(
    response.tool_calls.map(async (toolCall) => {
      const tool = tools.find(t => t.name === toolCall.name);
      if (!tool) {
        return `错误： 找不到工具：${toolCall.name}`;
      }

      console.log(`[执行工具] ${toolCall.name} （${JSON.stringify(toolCall.args)}）`);
      try {
        const result = await tool.invoke(toolCall.args);
        return result;
      } catch (error) {
        return `错误： ${error.message}`;
      }
    })
  );

  // 将工具结果添加到消息历史
  response.tool_calls.forEach((toolCall, index) => {
    messages.push(
      new ToolMessage({
        content: toolResults[index],
        // * tool_call_id 是用来关联工具调用和工具结果的，模型在生成回复时会根据 tool_call_id 来找到对应的工具结果，从而在回复中引用工具结果
        tool_call_id: toolCall.id
      })
    )
  });

  // 再次调用模型，传入工具结果
  response = await modelWithTools.invoke(messages);
}

console.log('\n[最终回复]');
console.log(response.content);
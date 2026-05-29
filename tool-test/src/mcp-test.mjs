import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import { HumanMessage, ToolMessage } from '@langchain/core/messages';

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME || "qwen-coder-turbo",
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.BASE_URL,
  },
});

const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    "amap-maps-streamableHTTP": {
      url: "https://mcp.amap.com/mcp?key=" + process.env.AMAP_MAPS_API_KEY,
    },
    "filesystem": {
      "command": 'npx',
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        ...(process.env.ALLOWED_PATHS.split(',') || '')
      ]
    }
  },
});

const tools = await mcpClient.getTools();
const modelWithTools = model.bindTools(tools);

async function runAgentWithTools(query, maxIterations = 30) {
  const messages = [new HumanMessage(query)];

  for (let i = 0; i < maxIterations; i++) {
    console.log(chalk.bgGreen(`⏳ 正在等待 AI 思考...`));
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    // 检查是否有工具调用
    if (!response.tool_calls || response.tool_calls.length === 0) {
      console.log(`\n✨ AI 最终回复:\n${response.content}\n`);
      return response.content;
    }

    console.log(
      chalk.bgBlue(`🔍 检测到 ${response.tool_calls.length} 个工具调用`),
    );
    console.log(
      chalk.bgBlue(`🔍 工具调用： ${response.tool_calls.map(t => t.name).join('， ')}`),
    )

    // 执行工具调用
    for (const toolCall of response.tool_calls) {
      const foundTool = tools.find(t => t.name === toolCall.name);
      if (foundTool) {
        const toolResult = await foundTool.invoke(toolCall.args);
        // 确保 content 是字符串类型
        // langchain 要求 message 的 content 是字符串 而 fileSystem返回的是 object 类型
        let contentStr 
        if (typeof toolResult === 'string') {
          contentStr = toolResult;
        } else if (toolResult && toolResult.text) {
          contentStr = toolResult.text;
        }
        messages.push(new ToolMessage({
          content: contentStr,
          tool_call_id: toolCall.id,
        }))
      }
    }
  }

  return messages[messages.length - 1].content;
}

await runAgentWithTools('读取 src/mcp-test.mjs 文件');

await mcpClient.close();

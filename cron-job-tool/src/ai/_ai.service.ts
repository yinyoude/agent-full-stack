import {
  AIMessage,
  BaseMessage,
  BaseMessageLike,
  HumanMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { ChatPromptValueInterface } from '@langchain/core/prompt_values';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import {
  Runnable,
  RunnableBranch,
  RunnableLambda,
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { Inject, Injectable } from '@nestjs/common';
import z from 'zod';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AgentState = {
  messages: BaseMessage[];
  response?: AIMessage;
  toolMessages?: ToolMessage[];
  done: boolean;
  final: string | null;
  tools: (typeof queryUserTool)[];
};

const database: {
  users: Record<string, User>;
} = {
  users: {
    '001': {
      id: '001',
      name: '张三',
      email: 'zhangsan@example.com',
      role: 'admin',
    },
    '002': {
      id: '002',
      name: '李四',
      email: 'lisi@example.com',
      role: 'user',
    },
    '003': {
      id: '003',
      name: '王五',
      email: 'wangwu@example.com',
      role: 'user',
    },
  },
};

const queryUserArgsSchema = z.object({
  userId: z.string().describe('用户 ID，例如: 001, 002, 003'),
});

type QueryUserArgs = z.infer<typeof queryUserArgsSchema>;

const queryUserTool = tool(
  ({ userId }: QueryUserArgs): string => {
    const user = database.users[userId];

    if (!user) {
      return `用户 ID ${userId} 不存在。可用的 ID: 001, 002, 003`;
    }

    return `用户信息：\n- ID: ${user.id}\n- 姓名: ${user.name}\n- 邮箱: ${user.email}\n- 角色: ${user.role}`;
  },
  {
    name: 'query_user',
    description:
      '查询数据库中的用户信息。输入用户 ID，返回该用户的详细信息（姓名、邮箱、角色）。',
    schema: queryUserArgsSchema,
  },
);

@Injectable()
export class AiService {
  private readonly modelWithTools: Runnable<
    ChatPromptValueInterface | BaseMessageLike[] | string,
    AIMessage
  >;

  constructor(@Inject('CHAT_MODEL') model: ChatOpenAI) {
    this.modelWithTools = model.bindTools([queryUserTool]);
  }

  private readonly toolExecutor = RunnableLambda.from(
    async (input: AgentState): Promise<ToolMessage[]> => {
      const { response, tools } = input;
      const toolResults: ToolMessage[] = [];

      for (const toolCall of response?.tool_calls ?? []) {
        const foundTool = tools.find((t) => t.name === toolCall.name);

        if (!foundTool) {
          continue;
        }
        const parsedArgs = queryUserArgsSchema.parse(toolCall.args);

        const toolResult = await foundTool.invoke(parsedArgs);

        const contentStr =
          typeof toolResult === 'string'
            ? toolResult
            : JSON.stringify(toolResult);

        toolResults.push(
          new ToolMessage({
            content: contentStr,
            tool_call_id: toolCall.id ?? '',
          }),
        );
      }

      return toolResults;
    },
  );

  async runChain(query: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        '你是一个智能助手，可以在需要时调用工具（如 query_user）来查询用户信息，再用结果回答用户的问题。',
      ],
      new MessagesPlaceholder('messages'),
    ]);

    const llmChain = prompt.pipe(this.modelWithTools);

    const agentStepChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        response: llmChain,
      }),

      RunnableBranch.from([
        [
          (state: AgentState) =>
            !state.response?.tool_calls ||
            state.response.tool_calls.length === 0,

          RunnableLambda.from((state: AgentState): AgentState => {
            const { messages, response } = state;

            if (!response) {
              return {
                ...state,
                done: true,
                final: '',
              };
            }

            return {
              ...state,
              messages: [...messages, response],
              done: true,
              final:
                typeof response.content === 'string'
                  ? response.content
                  : JSON.stringify(response.content),
            };
          }),
        ],

        RunnableSequence.from([
          RunnableLambda.from((state: AgentState): AgentState => {
            const { messages, response } = state;

            if (!response) {
              return state;
            }

            return {
              ...state,
              messages: [...messages, response],
            };
          }),

          RunnablePassthrough.assign({
            toolMessages: this.toolExecutor,
          }),

          RunnableLambda.from((state: AgentState): AgentState => {
            const { messages, toolMessages } = state;

            return {
              ...state,
              messages: [...messages, ...(toolMessages ?? [])],
              done: false,
            };
          }),
        ]),
      ]),
    ]);

    let state: AgentState = {
      messages: [new HumanMessage(query)],
      done: false,
      final: null,
      tools: [queryUserTool],
    };

    for (let i = 0; i < 30; i++) {
      state = await agentStepChain.invoke(state);

      if (state.done) {
        return state.final ?? '';
      }
    }

    const lastMessage = state.messages[state.messages.length - 1];

    return typeof lastMessage.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);
  }
}

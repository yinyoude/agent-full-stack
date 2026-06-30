import { AIMessage, ToolMessage } from '@langchain/core/messages';
import {
  Runnable,
  RunnableBranch,
  RunnableLambda,
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import type { StructuredToolInterface } from '@langchain/core/tools';
import type { ToolCallingAgentState } from '../entities/tool-calling-agent-state.entity';

type CreateToolCallingAgentChainParams = {
  llmChain: Runnable<ToolCallingAgentState, AIMessage>;
  tools: StructuredToolInterface[];
};

export function createToolCallingAgentChain({
  llmChain,
  tools,
}: CreateToolCallingAgentChainParams): Runnable<
  ToolCallingAgentState,
  ToolCallingAgentState
> {
  const toolExecutor = RunnableLambda.from(
    async (state: ToolCallingAgentState): Promise<ToolMessage[]> => {
      const toolResults: ToolMessage[] = [];

      for (const toolCall of state.response?.tool_calls ?? []) {
        const foundTool = tools.find((t) => t.name === toolCall.name);

        if (!foundTool) {
          continue;
        }

        const toolResult: unknown = await foundTool.invoke(toolCall.args);
        const content = stringifyToolResult(toolResult);

        toolResults.push(
          new ToolMessage({
            content,
            tool_call_id: toolCall.id ?? '',
          }),
        );
      }

      return toolResults;
    },
  );

  return RunnableSequence.from([
    RunnablePassthrough.assign({
      response: llmChain,
    }),
    RunnableBranch.from([
      [
        (state: ToolCallingAgentState) =>
          !state.response?.tool_calls || state.response.tool_calls.length === 0,

        RunnableLambda.from(
          (state: ToolCallingAgentState): ToolCallingAgentState => {
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
          },
        ),
      ],

      RunnableSequence.from([
        RunnableLambda.from(
          (state: ToolCallingAgentState): ToolCallingAgentState => {
            const { messages, response } = state;

            if (!response) {
              return state;
            }

            return {
              ...state,
              messages: [...messages, response],
            };
          },
        ),

        RunnablePassthrough.assign({
          toolMessages: toolExecutor,
        }),

        RunnableLambda.from(
          (state: ToolCallingAgentState): ToolCallingAgentState => {
            const { messages, toolMessages } = state;

            return {
              ...state,
              messages: [...messages, ...(toolMessages ?? [])],
              done: false,
            };
          },
        ),
      ]),
    ]),
  ]) as Runnable<ToolCallingAgentState, ToolCallingAgentState>;
}

function stringifyToolResult(result: unknown): string {
  if (typeof result === 'string') {
    return result;
  }

  return JSON.stringify(result) ?? String(result);
}

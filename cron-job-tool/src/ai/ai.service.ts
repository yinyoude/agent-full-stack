import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Injectable } from '@nestjs/common';
import { UserAgentChain } from './chains/user-agent.chain';
import type { ToolCallingAgentState } from './entities/tool-calling-agent-state.entity';
import { getMessageContent } from '../utils';

@Injectable()
export class AiService {
  private readonly maxIterations = 30;

  constructor(private readonly userAgentChain: UserAgentChain) {}

  async runChain(query: string): Promise<string> {
    const chain = this.userAgentChain.createChain();

    let state: ToolCallingAgentState = {
      messages: [new HumanMessage(query)],
      done: false,
      final: null,
    };

    for (let i = 0; i < this.maxIterations; i++) {
      state = await chain.invoke(state);

      if (state.done) {
        return state.final ?? '';
      }
    }

    const lastMessage = state.messages[state.messages.length - 1];

    return lastMessage ? getMessageContent(lastMessage) : '';
  }

  async *streamChain(query: string): AsyncGenerator<string> {
    const chain = this.userAgentChain.createChain();

    let state: ToolCallingAgentState = {
      messages: [new HumanMessage(query)],
      done: false,
      final: null,
    };

    for (let i = 0; i < this.maxIterations; i++) {
      let nextState: ToolCallingAgentState | null = null;
      const stream = chain.streamEvents(state, { version: 'v2' });

      for await (const streamEvent of stream) {
        if (streamEvent.event === 'on_chat_model_stream') {
          const text = getMessageContent(streamEvent.data.chunk as BaseMessage);

          if (text) {
            yield text;
          }
        }

        if (
          streamEvent.event === 'on_chain_end' &&
          streamEvent.name === 'user_agent_chain'
        ) {
          nextState = streamEvent.data.output as ToolCallingAgentState;
        }
      }

      if (!nextState) {
        return;
      }

      state = nextState;

      if (state.done) {
        return;
      }
    }
  }
}

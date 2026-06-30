import type { AIMessage } from '@langchain/core/messages';
import type { Runnable } from '@langchain/core/runnables';
import { Injectable } from '@nestjs/common';
import type { ToolCallingAgentState } from '../entities/tool-calling-agent-state.entity';
import { createUserAgentPrompt } from '../prompts/user-agent.prompt';
import { ToolRegistry } from '../tools/tool.registry';
import { createToolCallingAgentChain } from './tool-calling-agent.chain';
import { LlmProvider } from '../../providers/llm.provider';

@Injectable()
export class UserAgentChain {
  constructor(
    private readonly llmProvider: LlmProvider,
    private readonly toolRegistry: ToolRegistry,
  ) {}

  createChain(): Runnable<ToolCallingAgentState, ToolCallingAgentState> {
    const tools = this.toolRegistry.getUserTools();
    const modelWithTools = this.llmProvider.withTools(tools);
    const prompt = createUserAgentPrompt();

    const llmChain = prompt.pipe(modelWithTools) as Runnable<
      ToolCallingAgentState,
      AIMessage
    >;

    return createToolCallingAgentChain({
      llmChain,
      tools,
    }).withConfig({
      runName: 'user_query_chain',
    });
  }
}

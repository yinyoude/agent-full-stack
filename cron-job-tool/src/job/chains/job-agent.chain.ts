import { HumanMessage, type AIMessage } from '@langchain/core/messages';
import type { Runnable } from '@langchain/core/runnables';
import { Injectable } from '@nestjs/common';
import { LlmProvider } from '../../providers/llm.provider';
import { SendMailTool } from '../../ai/tools/send-mail.tool';
import { DbUsersCRUDTool } from '../../ai/tools/db-users-crud.tool';
import { TimeNowTool } from '../../ai/tools/time-now-tool';
import { WebSearchTool } from '../../ai/tools/web-search.tool';
import { ToolCallingAgentState } from '../../ai/entities/tool-calling-agent-state.entity';
import { createCronAgentPrompt } from '../prompts/job-agent.prompt';
import { createToolCallingAgentChain } from '../../ai/chains/tool-calling-agent.chain';
import { getMessageContent } from '../../utils';

@Injectable()
export class JobAgentChain {
  readonly jobAgentChain: Runnable<
    ToolCallingAgentState,
    ToolCallingAgentState
  >;
  constructor(
    private readonly llmProvider: LlmProvider,
    private readonly sendMailTool: SendMailTool,
    private readonly webSearchTool: WebSearchTool,
    private readonly dbUsersCRUDTool: DbUsersCRUDTool,
    private readonly timeNowTool: TimeNowTool,
  ) {
    this.jobAgentChain = this.createChain();
  }

  createChain(): Runnable<ToolCallingAgentState, ToolCallingAgentState> {
    const tools = [
      this.sendMailTool.getTool(),
      this.webSearchTool.getTool(),
      this.dbUsersCRUDTool.getTool(),
      this.timeNowTool.getTool(),
    ];
    const modelWithTools = this.llmProvider.withTools(tools);
    const prompt = createCronAgentPrompt();

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

  async runJob(query: string) {
    let state: ToolCallingAgentState = {
      messages: [new HumanMessage(query)],
      done: false,
      final: null,
    };

    while (true) {
      state = await this.jobAgentChain.invoke(state);

      if (state.done) {
        const lastMessage = state.messages[state.messages.length - 1];
        return lastMessage ? getMessageContent(lastMessage) : '';
      }
    }
  }
}

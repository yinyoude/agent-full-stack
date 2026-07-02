import type { AIMessage } from '@langchain/core/messages';
import type { Runnable } from '@langchain/core/runnables';
import { Injectable } from '@nestjs/common';
import type { ToolCallingAgentState } from '../entities/tool-calling-agent-state.entity';
import { createUserAgentPrompt } from '../prompts/user-agent.prompt';
import { createToolCallingAgentChain } from './tool-calling-agent.chain';
import { LlmProvider } from '../../providers/llm.provider';
import { SendMailTool } from '../tools/send-mail.tool';
import { DbUsersCRUDTool } from '../tools/db-users-crud.tool';
import { WebSearchTool } from '../tools/web-search.tool';
import { CronJobTool } from '../tools/cron-job.tool';
import { TimeNowTool } from '../tools/time-now-tool';

@Injectable()
export class UserAgentChain {
  constructor(
    private readonly llmProvider: LlmProvider,
    private readonly sendMailTool: SendMailTool,
    private readonly webSearchTool: WebSearchTool,
    private readonly dbUsersCRUDTool: DbUsersCRUDTool,
    private readonly cornJobTool: CronJobTool,
    private readonly timeNowTool: TimeNowTool,
  ) {}

  createChain(): Runnable<ToolCallingAgentState, ToolCallingAgentState> {
    const tools = [
      this.sendMailTool.getTool(),
      this.webSearchTool.getTool(),
      this.dbUsersCRUDTool.getTool(),
      this.cornJobTool.getTool(),
      this.timeNowTool.getTool(),
    ];
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
      runName: 'user_agent_chain',
    });
  }
}

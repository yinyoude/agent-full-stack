import { Injectable } from '@nestjs/common';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { QueryUserTool } from './query-user.tool';
import { SendMailTool } from './send-mail.tool';

export type AgentName = 'user-agent';

@Injectable()
export class ToolRegistry {
  constructor(
    private readonly queryUserTool: QueryUserTool,
    private readonly sendMailTool: SendMailTool,
  ) {}

  getUserTools(): StructuredToolInterface[] {
    return [this.queryUserTool.getTool(), this.sendMailTool.getTool()];
  }

  getToolsByAgent(agentName: AgentName): StructuredToolInterface[] {
    if (agentName === 'user-agent') {
      return this.getUserTools();
    }

    return [];
  }
}

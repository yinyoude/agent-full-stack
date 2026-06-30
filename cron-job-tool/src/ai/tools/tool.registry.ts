import { Injectable } from '@nestjs/common';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { QueryUserTool } from './query-user.tool';

export type AgentName = 'user-agent';

@Injectable()
export class ToolRegistry {
  constructor(private readonly queryUserTool: QueryUserTool) {}

  getUserTools(): StructuredToolInterface[] {
    return [this.queryUserTool.getTool()];
  }

  getToolsByAgent(agentName: AgentName): StructuredToolInterface[] {
    if (agentName === 'user-agent') {
      return this.getUserTools();
    }

    return [];
  }
}

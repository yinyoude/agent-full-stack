import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { UserAgentChain } from './chains/user-agent.chain';
import { LlmProvider } from './models/llm.provider';
import { QueryUserTool } from './tools/query-user.tool';
import { ToolRegistry } from './tools/tool.registry';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    UserAgentChain,
    LlmProvider,
    QueryUserTool,
    ToolRegistry,
  ],
})
export class AiModule {}

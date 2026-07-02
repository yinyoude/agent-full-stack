import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { UserAgentChain } from './chains/user-agent.chain';
import { LlmProvider } from '../providers/llm.provider';
import { UsersModule } from '../users/users.module';
import { ToolModule } from './tools/tool.module';

@Module({
  imports: [UsersModule, ToolModule],
  controllers: [AiController],
  providers: [AiService, UserAgentChain, LlmProvider],
})
export class AiModule {}

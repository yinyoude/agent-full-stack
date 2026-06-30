import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { UserAgentChain } from './chains/user-agent.chain';
import { ToolRegistry } from './tools/tool.registry';
import { MailerModule } from '@nestjs-modules/mailer';
import { LlmProvider } from '../providers/llm.provider';
import { MailProvider } from '../providers/mail.provider';
import { WebSearchTool } from './tools/web-search.tool';
import { QueryUserTool } from './tools/query-user.tool';
import { SendMailTool } from './tools/send-mail.tool';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useClass: MailProvider,
    }),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    UserAgentChain,
    LlmProvider,
    QueryUserTool,
    SendMailTool,
    ToolRegistry,
    WebSearchTool,
  ],
})
export class AiModule {}

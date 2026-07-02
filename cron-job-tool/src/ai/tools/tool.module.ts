import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module';
import { JobModule } from '../../job/job.module';
import { WebSearchTool } from './web-search.tool';
import { DbUsersCRUDTool } from './db-users-crud.tool';
import { CronJobTool } from './cron-job.tool';
import { TimeNowTool } from './time-now-tool';
import { SendMailTool } from './send-mail.tool';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { MailProvider } from '../../providers/mail.provider';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useClass: MailProvider,
    }),
    UsersModule,
    forwardRef(() => JobModule),
  ],
  providers: [
    WebSearchTool,
    DbUsersCRUDTool,
    CronJobTool,
    TimeNowTool,
    SendMailTool,
  ],
  exports: [
    WebSearchTool,
    DbUsersCRUDTool,
    CronJobTool,
    TimeNowTool,
    SendMailTool,
  ],
})
export class ToolModule {}

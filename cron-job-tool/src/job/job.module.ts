import { forwardRef, Module } from '@nestjs/common';
import { JobService } from './job.service';
import { ToolModule } from '../ai/tools/tool.module';
import { JobAgentChain } from './chains/job-agent.chain';
import { LlmProvider } from '../providers/llm.provider';

@Module({
  imports: [forwardRef(() => ToolModule)],
  providers: [LlmProvider, JobService, JobAgentChain],
  exports: [JobService],
})
export class JobModule {}

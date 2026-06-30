import type { AIMessage, BaseMessageLike } from '@langchain/core/messages';
import type { ChatPromptValueInterface } from '@langchain/core/prompt_values';
import type { Runnable } from '@langchain/core/runnables';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmProvider {
  private model?: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {}

  withTools(
    tools: StructuredToolInterface[],
  ): Runnable<
    ChatPromptValueInterface | BaseMessageLike[] | string,
    AIMessage
  > {
    return this.getModel().bindTools(tools);
  }

  private getModel(): ChatOpenAI {
    this.model ??= new ChatOpenAI({
      temperature: 0.7,
      modelName: this.configService.get<string>('MODEL_NAME'),
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      configuration: {
        baseURL: this.configService.get<string>('BASE_URL'),
      },
    });

    return this.model;
  }
}

import type {
  AIMessage,
  BaseMessage,
  ToolMessage,
} from '@langchain/core/messages';

export type ToolCallingAgentState = {
  messages: BaseMessage[];
  response?: AIMessage;
  toolMessages?: ToolMessage[];
  done: boolean;
  final: string | null;
};

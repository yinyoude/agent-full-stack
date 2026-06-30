import { BaseMessage } from '@langchain/core/messages';

export const getMessageContent = (message: BaseMessage): string => {
  return typeof message.content === 'string'
    ? message.content
    : JSON.stringify(message.content);
};

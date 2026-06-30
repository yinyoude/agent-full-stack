import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';

export const USER_AGENT_SYSTEM_PROMPT =
  '你是一个智能助手，可以在需要时调用工具（如 query_user）来查询用户信息，再用结果回答用户的问题。';

export function createUserAgentPrompt() {
  return ChatPromptTemplate.fromMessages([
    ['system', USER_AGENT_SYSTEM_PROMPT],
    new MessagesPlaceholder('messages'),
  ]);
}

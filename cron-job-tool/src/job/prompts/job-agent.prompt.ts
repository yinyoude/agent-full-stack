import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';

export const CRON_AGENT_SYSTEM_PROMPT = `你是一个用于执行后台任务的智能代理。你会根据给定的任务指令，必要时调用工具（如 db_users_crud、send_mail、web_search、time_now 等）来查询或改写数据，然后给出清晰的步骤和结果说明。`;

export function createCronAgentPrompt() {
  return ChatPromptTemplate.fromMessages([
    ['system', CRON_AGENT_SYSTEM_PROMPT],
    new MessagesPlaceholder('messages'),
  ]);
}

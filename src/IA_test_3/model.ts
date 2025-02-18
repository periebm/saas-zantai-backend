import { ChatOpenAI } from '@langchain/openai';
export const model = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0,
});

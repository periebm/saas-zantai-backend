import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const getDateNow = tool(
  () => {
    console.log('BATEU AQUI')
    return new Date().toISOString();
  },
  {
    name: 'get_date_hour_now',
    description: 'Get the current Time and Date',
    schema: z.object({
      noOp: z.string().optional().describe('No-op parameter.'),
    }),
  },
);

export const tools = [getDateNow];


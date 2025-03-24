import dotenv from 'dotenv';
import { z } from 'zod';

let path = '.env.dev';
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'stage') {
  path = '.env';
}

dotenv.config({ path });

const envSchema = z
  .object({
    NODE_ENV: z.string(),
    PORT: z.preprocess((val) => (val ? Number(val) : 3005), z.number().default(3005)),
    OPENAI_API_KEY: z.string(),
  })
  .passthrough();

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Environment Variable Error:', JSON.stringify(parsedEnv.error.format(), null, 2));
  throw new Error('Invalid environment variables. Check the logs above.');
}

export const envConfig = {
  env: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  openAI: {
    key: parsedEnv.data.OPENAI_API_KEY,
  },
};

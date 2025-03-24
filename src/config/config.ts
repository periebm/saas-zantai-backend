import dotenv from 'dotenv';
import { z } from 'zod';

let path = '.env.dev';
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'stage') {
  path = '.env';
}

dotenv.config({ path });

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production', 'stage']).default('development'),
    PORT: z.preprocess((val) => (val ? Number(val) : 3005), z.number().default(3005)),
    OPENAI_API_KEY: z.string(),

    // Variáveis do banco de dados
    DB_USER: z.string().default('postgres'),
    DB_HOST: z.string().default('localhost'),
    DB_NAME: z.string().default('postgres'),
    DB_PASSWORD: z.string().default(''),
    DB_PORT: z.preprocess((val) => (val ? Number(val) : 5432), z.number().default(5432)),
    DB_POOL_MAX: z.preprocess((val) => (val ? Number(val) : 20), z.number().default(20)),
    DB_POOL_IDLE_TIMEOUT: z.preprocess(
      (val) => (val ? Number(val) : 30000),
      z.number().default(30000),
    ),
    DB_CONNECTION_TIMEOUT: z.preprocess(
      (val) => (val ? Number(val) : 2000),
      z.number().default(2000),
    ),
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
  db: {
    user: parsedEnv.data.DB_USER,
    host: parsedEnv.data.DB_HOST,
    database: parsedEnv.data.DB_NAME,
    password: parsedEnv.data.DB_PASSWORD,
    port: parsedEnv.data.DB_PORT,
    pool: {
      max: parsedEnv.data.DB_POOL_MAX,
      idleTimeout: parsedEnv.data.DB_POOL_IDLE_TIMEOUT,
      connectionTimeout: parsedEnv.data.DB_CONNECTION_TIMEOUT,
    },
  },
};

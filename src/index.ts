import express from 'express';
import './config/config';
import cors from 'cors';
import helmet from 'helmet';
import { setupRoutes } from './config/routes';
import { envConfig } from './config/config';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler';
import limiter from './middleware/rateLimiterMiddleware';
import Winston from './infraestructure/logger/Winston';
import { ILogger } from './infraestructure/ILogger';

const app = express();
app.use(express.json());
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('Expect-CT', 'max-age=86400, enforce');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()',
  );
  next();
});
app.use(cors());
app.use(limiter);
app.use(cookieParser());

setupRoutes(app);
app.use(errorHandler.handleError);

const PORT = envConfig.port || 3001;

app.listen(PORT, () => {
  console.log(`ZantaiAPI: Up and Running in [${envConfig.env}] mode on port [${PORT}]`);
});

process.on('uncaughtException', (err) => {
  const logger: ILogger = new Winston();
  logger.error('UncaughtException');
  logger.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const logger: ILogger = new Winston();
  logger.error('UnhandledRejection');
  if (reason) logger.error(reason);
  process.exit(1);
});

/* import 'dotenv/config';

import { graph2 } from './IA_test_2/Graph';
import { printGraph } from './printGraph';

async function startAi2() {
  const threadId = 'refund_testing_id';
  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  await printGraph();
  while (true) {
    const userInput = await new Promise<string>((resolve) => {
      const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Você: ', (answer: string) => {
        rl.close();
        resolve(answer);
      });
    });

    messages.push({
      role: 'user',
      content: userInput,
    });

    const stream = await graph2.stream(
      {
        messages,
      },
      {
        configurable: {
          thread_id: threadId,
        },
      },
    );

    let assistantMessage = [];
    for await (const value of stream) {
      console.log(value);
      if (value?.receptionist_agent?.messages?.[0]?.content) {
        assistantMessage.push(value.receptionist_agent.messages[0].content);
      }
      if (value?.anime_support?.messages?.content) {
        assistantMessage.push(value.anime_support.messages.content);
      }
      if (value?.film_support?.messages?.content) {
        assistantMessage.push(value.film_support.messages.content);
      }
    }

    // Adiciona a mensagem da IA no histórico
    if (assistantMessage) {
      messages.push({
        role: 'assistant',
        content: assistantMessage[assistantMessage.length - 1],
      });

      console.log(`IA: ${assistantMessage}`);
    } else {
      console.error('Erro: Não foi possível obter a resposta da IA.');
    }
  }
}

(async function () {
  try {
    await startAi2();
    console.log('AI workflow started successfully.');
  } catch (error) {
    console.error('Error starting AI workflow:', error);
  }
})();
 */

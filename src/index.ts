import express from 'express';
import './config/config';
import cors from 'cors';
import helmet from 'helmet';
import { setupRoutes } from './config/routes';
import { envConfig } from './config/config';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler';
import limiter from './middleware/rateLimiterMiddleware';
import Winston from './infrastructure/logger/Winston';
import { ILogger } from './infrastructure/ILogger';
import { databaseConnection } from './config/database';
import messageRepository from './repositories/messageRepository';
import { MessagesService } from './features/messages/MessagesService';
import './IA_Agent/Graph';
import { AgentService } from './features/agent/AgentService';
import agentRepository from './repositories/agentRepository';
import { Server } from 'socket.io';

const app = express();
app.use(express.json());
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('Expect-CT', 'max-age=86400, enforce');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
app.use(cors());
app.use(limiter);
app.use(cookieParser());

setupRoutes(app);
app.use(errorHandler.handleError);

const PORT = envConfig.port || 3001;

const server = app.listen(PORT, () => {
  console.log(`ZantaiAPI: Up and Running in [${envConfig.env}] mode on port [${PORT}]`);
});

export const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // URL do seu frontend
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
databaseConnection.startDatabase();

const interval = 2000; // Intervalo de 5 segundos

const startServiceCall = () => {
  setInterval(async () => {
    const notRespondedMessages = await messageRepository.getNotAnsweredMessages();
    if (notRespondedMessages.length) {
      const agentService = new AgentService(agentRepository, messageRepository);

      await agentService.callAiAgent(notRespondedMessages[0]);
    }
  }, interval);
};

// Inicia a chamada do serviço
startServiceCall();

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  // O cliente envia seu número para se "inscrever" nas atualizações
  socket.on('subscribe', (phoneNumber: string) => {
    socket.join(phoneNumber); // Cria uma "sala" para esse número
    console.log(`Cliente ${socket.id} inscrito para: ${phoneNumber}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
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

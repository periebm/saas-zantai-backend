import winston from 'winston'; //Log
import { ILogger } from '../ILogger';

export default class Winston implements ILogger {
  private logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: this.timezoned }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [new winston.transports.Console()],
      exceptionHandlers: [new winston.transports.Console()],
      rejectionHandlers: [new winston.transports.Console()],
    });
  }

  private timezoned = () => {
    return new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });
  };

  info(message: string | object): void {
    this.logger.info(message);
  }

  debug(message: string | object): void {
    this.logger.debug(message);
  }

  error(message: string | object): void {
    this.logger.error(message);
  }

  warn(message: string | object): void {
    this.logger.warn(message);
  }
}

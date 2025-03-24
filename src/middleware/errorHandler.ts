import { NextFunction, Response, Request } from 'express';
import { HttpStatusCode } from 'axios';
import { AppError } from '../errors/AppError';
import { ILogger } from '../infrastructure/ILogger';
import Winston from '../infrastructure/logger/Winston';

class ErrorHandler {
  constructor() {
    this.handleError = this.handleError.bind(this);
  }

  async handleError(err: any, req: Request, res: Response, next: NextFunction) {
    const ip = req.headers['x-forwarded-for']
      ? (req.headers['x-forwarded-for'] as string).split(',')[0]
      : (req.socket.remoteAddress as string);

    const logger: ILogger = new Winston();
    logger.error({
      level: 'error',
      message: err.message,
      stack: err.stack,
      location: err.location,
      name: err.name,
      originalErrorMessage: err.originalErrorMessage,
      statusCode: err.statusCode,
      ip: ip,
      username: res.locals.username || 'N/A',
    });

    if (err instanceof AppError) {
      const responseError = {
        success: false,
        statusCode: err.statusCode,
        message: err.message,
      };
      res.status(err.statusCode).send(responseError);
      return;
    }

    res.status(HttpStatusCode.BadRequest).send({
      success: false,
      statusCode: HttpStatusCode.BadRequest,
      message: 'An error occurred.',
    });
    return;
  }
}

const errorHandler = new ErrorHandler();

export default errorHandler;

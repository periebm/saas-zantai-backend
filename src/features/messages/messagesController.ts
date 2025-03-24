import { NextFunction, Request, Response } from 'express';
import { MessagesService } from './MessagesService';
import healthCheckRepository from '../../repositories/HealthCheckRepository';
import { HttpStatusCode } from 'axios';

class MessagesController {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    try {
      const messagesController = new MessagesService(healthCheckRepository);

      const response = await messagesController.sendMessage(body);
      res.status(HttpStatusCode.Created).send(response);
      return;
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

const messagesController = new MessagesController();

export default messagesController;

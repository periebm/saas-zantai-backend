import { NextFunction, Request, Response } from 'express';
import { MessagesService } from './MessagesService';
import healthCheckRepository from '../../repositories/healthCheckRepository';
import { HttpStatusCode } from 'axios';
import messageRepository from '../../repositories/messageRepository';

class MessagesController {
  async pastMessages(req: Request, res: Response, next: NextFunction) {
    const thread = req.params.thread;
    try {
      const messagesService = new MessagesService(messageRepository);
      const response = await messagesService.getPastMessages(thread);
      res.status(HttpStatusCode.Ok).send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    try {
      const messagesService = new MessagesService(messageRepository);
      const response = await messagesService.sendMessage(body);
      res.status(HttpStatusCode.Created).send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async deleteMessages(req: Request, res: Response, next: NextFunction) {
    const thread = req.params.thread;
    try {
      const messagesService = new MessagesService(messageRepository);
      await messagesService.deleteMessagesByThread(thread);
      res.status(HttpStatusCode.NoContent).send();
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

const messagesController = new MessagesController();

export default messagesController;

import { Router } from 'express';
import messagesController from './messagesController';

const messagesRoute: Router = Router();

messagesRoute.post('/', messagesController.sendMessage);

export default messagesRoute;

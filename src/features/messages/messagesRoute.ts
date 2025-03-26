import { Router } from 'express';
import messagesController from './messagesController';

const messagesRoute: Router = Router();

messagesRoute.get('/:thread', messagesController.pastMessages);
messagesRoute.post('/', messagesController.sendMessage);
messagesRoute.delete('/:thread', messagesController.deleteMessages);

export default messagesRoute;

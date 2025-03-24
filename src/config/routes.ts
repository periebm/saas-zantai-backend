import { Router, Express } from 'express';
import healthCheckRouter from '../features/healthCheck/healthCheckRoute';
import messagesRoute from '../features/messages/messagesRoute';

export const setupRoutes = (app: Express): void => {
  const router: Router = Router();

  app.use('/api', router);
  router.use(healthCheckRouter);
  router.use('/messages', messagesRoute);
};

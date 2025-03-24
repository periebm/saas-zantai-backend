import { Router } from 'express';
import healthCheckController from './healthCheckController';

const healthCheckRouter: Router = Router();

healthCheckRouter.get('/health', healthCheckController.checkHealth);

export default healthCheckRouter;

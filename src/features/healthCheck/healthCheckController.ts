import { NextFunction, Request, Response } from 'express';
import { HealthCheckService } from './HealthCheckService';
import healthCheckRepository from '../../repositories/HealthCheckRepository';

class HealthCheckController {
  async checkHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const healthCheckService = new HealthCheckService(healthCheckRepository);

      const response = await healthCheckService.checkHealth();
      res.send(response);
      return;
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

const healthCheckController = new HealthCheckController();

export default healthCheckController;

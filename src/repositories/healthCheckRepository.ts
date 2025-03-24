import { databaseConnection } from '../config/database';
import { IHealthCheckRepository } from '../features/healthCheck/IHealthCheckRepository';

class HealthCheckRepository implements IHealthCheckRepository {
  async databaseHealth(): Promise<number | undefined> {
    try {
      const response = await databaseConnection.query('SELECT 1');
      return response.rows[0]?.hasOwnProperty('?column?') ? 1 : undefined;
    } catch (error) {
      console.error('PostgreSQL health check failed:', error);
      return undefined;
    }
  }
}

const healthCheckRepository = new HealthCheckRepository();

export default healthCheckRepository;

import { databaseConnection } from '../config/database';
import { IHealthCheckRepository } from '../features/healthCheck/IHealthCheckRepository';

class MessageRepository implements IHealthCheckRepository {
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

const messageRepository = new MessageRepository();

export default messageRepository;

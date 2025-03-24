/* import DatabaseConnection from '../config/Database';
 */ import { IHealthCheckRepository } from '../features/healthCheck/IHealthCheckRepository';

class HealthCheckRepository implements IHealthCheckRepository {
  private async init() {
    /*     const conn = new DatabaseConnection();
    const pool = await conn.connectWithDB();
    const release = conn.doRelease;
    return {
      pool,
      release,
    }; */
  }

  async oracleHealth(): Promise<number | undefined> {
    /*     const { pool, release } = await this.init();
     */
    try {
      /*       const response = await pool.execute(`
            SELECT 1 FROM DUAL
            `);
      release(pool);

      return response?.rows; */
      return 1;
    } catch (error) {
      /*       release(pool);
       */ console.log(error);
      /*       return undefined; */
    }
  }
}

const healthCheckRepository = new HealthCheckRepository();

export default healthCheckRepository;

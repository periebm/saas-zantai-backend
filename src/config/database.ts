import { AppError } from '../errors/AppError';
import { HttpStatusCode } from 'axios';
import { Pool, PoolClient, PoolConfig } from 'pg';
import { ILogger } from '../infrastructure/ILogger';
import Winston from '../infrastructure/logger/Winston';
import { envConfig } from './config';

class DatabaseConnection {
  private pool: Pool | null = null;

  private async connectWithDB(): Promise<Pool> {
    if (!this.pool) {
      const dbConfig: PoolConfig = {
        user: envConfig.db.user,
        host: envConfig.db.host,
        database: envConfig.db.database,
        password: envConfig.db.password,
        port: envConfig.db.port,
        max: envConfig.db.pool.max,
        idleTimeoutMillis: envConfig.db.pool.idleTimeout,
        connectionTimeoutMillis: envConfig.db.pool.connectionTimeout,
      };

      // Cria a pool de conexões
      this.pool = new Pool(dbConfig);

      // Adiciona listeners para eventos da pool
      this.pool.on('error', (err: Error) => {
        const logger: ILogger = new Winston();
        logger.error(`Unexpected error on idle client ${err}`);
      });
    }

    return this.pool;
  }

  public async startDatabase(): Promise<void> {
    try {
      const logger: ILogger = new Winston();
      await this.connectWithDB();

      // Testa a conexão obtendo um cliente e liberando imediatamente
      const client = await this.pool!.connect();
      client.release();

      logger.info('Database Connected and Started!');
    } catch (error) {
      throw new AppError(
        'Error connecting to database',
        HttpStatusCode.InternalServerError,
        'ERROR : Database > startDatabase',
        error,
      );
    }
  }

  public async getPool(): Promise<Pool> {
    if (!this.pool) {
      throw new AppError(
        'Error connecting to database',
        HttpStatusCode.InternalServerError,
        'ERROR : Database > getPool',
      );
    }
    return this.pool;
  }

  public async getConnection(): Promise<PoolClient> {
    if (!this.pool) {
      const logger: ILogger = new Winston();
      logger.warn('Pool not initialized. Trying to reconnect...');

      try {
        await this.connectWithDB();
      } catch (error) {
        throw new AppError(
          'Error connecting to database',
          HttpStatusCode.InternalServerError,
          'ERROR : Database > getConnection',
          error,
        );
      }

      if (!this.pool) {
        throw new AppError(
          'Failed to initialize connection pool.',
          HttpStatusCode.InternalServerError,
          'ERROR : Database > getConnection',
        );
      }
    }

    return await this.pool.connect();
  }

  public async doRelease(connection: PoolClient): Promise<void> {
    try {
      connection.release(); // No PostgreSQL usamos release() em vez de close()
    } catch (err) {
      throw new AppError(
        'Error releasing database connection',
        HttpStatusCode.InternalServerError,
        'ERROR : Database > doRelease',
        err,
      );
    }
  }

  // Método para encerrar a pool (opcional, para desligamento limpo)
  public async closePool(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  // Método auxiliar para executar queries diretamente
  public async query(text: string, params?: any[]) {
    const client = await this.getConnection();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      await this.doRelease(client);
    }
  }
}

export const databaseConnection = new DatabaseConnection();

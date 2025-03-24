export interface IHealthCheckRepository {
  databaseHealth(): Promise<number | undefined>;
}

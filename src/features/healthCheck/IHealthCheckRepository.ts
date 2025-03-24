export interface IHealthCheckRepository {
  oracleHealth(): Promise<number | undefined>;
}

export interface IMessagesRepository {
  oracleHealth(): Promise<number | undefined>;
}

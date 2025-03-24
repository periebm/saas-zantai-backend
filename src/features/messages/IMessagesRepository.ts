export interface IMessagesRepository {
  databaseHealth(): Promise<number | undefined>;
}

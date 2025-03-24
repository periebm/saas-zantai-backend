export interface ILogger {
  info(message: string | object | undefined): void,
  debug(message: string | object | undefined): void,
  error(message: string | object | undefined): void,
  warn(message: string | object | undefined): void,
}
export class AppError extends Error {
  public statusCode: number;
  public location: string;
  public originalErrorMessage?: any;

  constructor(message: string, statusCode: number, location: string, originalErrorMessage?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.location = location;
    this.originalErrorMessage = originalErrorMessage || '';

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

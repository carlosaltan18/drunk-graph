export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(`${statusCode}: ${message}`);
    this.name = "ApiError";
  }
}

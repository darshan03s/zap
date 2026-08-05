export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: number = 500,
    options?: ErrorOptions
  ) {
    super(message, options)
    this.name = 'ApiError'
  }
}

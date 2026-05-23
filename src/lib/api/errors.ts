export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
    public readonly code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFound(resource = "Resource"): AppError {
  return new AppError(`${resource} not found`, 404, "NOT_FOUND");
}

export function badRequest(message: string, code = "BAD_REQUEST"): AppError {
  return new AppError(message, 400, code);
}

export function unauthorized(message = "Unauthorized"): AppError {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function forbidden(message = "Forbidden", code = "FORBIDDEN"): AppError {
  return new AppError(message, 403, code);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

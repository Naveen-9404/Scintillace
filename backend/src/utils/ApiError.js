class ApiError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    // Backwards-compatible guard for legacy callers that supplied
    // (statusCode, message). Keep every error response well-formed
    // while modules are exercised during API testing.
    if (typeof message === "number" && typeof statusCode === "string") {
      [message, statusCode] = [statusCode, message];
    }

    super(message);

    this.name = this.constructor.name;

    this.statusCode = statusCode;

    this.errors = Array.isArray(errors) ? errors : [errors];

    this.success = false;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default ApiError;

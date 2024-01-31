const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 403, // Corrected typo in status code name
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

class AppError extends Error {
  public logError: any;

  constructor(
    public name: string,
    public statusCode: any,
    description: string | undefined,
    public isOperational: any,
    public errorStack: any,
    public logingErrorResponse: any
  ) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorStack = errorStack;
    this.logError = logingErrorResponse;
    Error.captureStackTrace(this, AppError);
  }
}

// API Specific Errors
class APIError extends AppError {
  constructor(
    name: any,
    statusCode = STATUS_CODES.INTERNAL_ERROR,
    description = "Internal Server Error",
    isOperational = true
  ) {
    super(name, statusCode, description, isOperational, undefined, undefined);
  }
}

//authentication
class UnAuthorized extends AppError {
  constructor(description = "unauthorized", errorStack: any) {
    super(
      "UnAuthorized",
      STATUS_CODES.UNAUTHORIZED,
      description,
      true,
      undefined,
      errorStack
    );
  }
}

// 400
class BadRequestError extends AppError {
  constructor(description = "Bad request", logingErrorResponse: any) {
    super(
      "BAD REQUEST",
      STATUS_CODES.BAD_REQUEST,
      description,
      true,
      undefined,
      logingErrorResponse
    );
  }
}

// 400
class ValidationError extends AppError {
  constructor(description = "Validation Error", errorStack: any) {
    super(
      "BAD REQUEST",
      STATUS_CODES.BAD_REQUEST,
      description,
      true,
      errorStack,
      undefined
    );
  }
}

// module.exports = {
//     AppError,
//     APIError,
//     BadRequestError,
//     ValidationError,
//     STATUS_CODES,
// };

export {
  AppError,
  APIError,
  BadRequestError,
  ValidationError,
  STATUS_CODES,
  UnAuthorized,
};

import { logger } from "./logger";

export abstract class AppError extends Error {
  abstract readonly status: number;
  abstract readonly code: string;

  constructor(message: string, public override readonly cause?: unknown) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

export class AuthError extends AppError {
  readonly status = 500;
  readonly code = "AUTH_ERROR";

  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class ValidateError extends AppError {
  readonly status = 400;
  readonly code = "VALIDATION_ERROR";

  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

export class DomainError extends AppError {
  readonly code = "DOMAIN_ERROR";
  readonly status: number;

  constructor(params: {
    status: number;
    code?: string;
    message: string;
    cause?: unknown;
  }) {
    super(params.message, params.cause);
    this.status = params.status;
  }
}

export class DatabaseError extends AppError {
  readonly code = "DATABASE_ERROR";
  readonly status: number;
  readonly logMessage: string;

  constructor(params: {
    status: number;
    message: string;
    logMessage: string;
    cause?: unknown;
  }) {
    super(params.message, params.cause);
    this.status = params.status;
    this.logMessage = params.logMessage;
  }
}

export function mapPgError(error: any): DatabaseError {
  switch (error?.code) {
    // Infra
    case "08006":
      return new DatabaseError({
        status: 503,
        message: "Service temporarily unavailable",
        logMessage: "PostgreSQL connection failure",
        cause: error,
      });

    case "53300":
      return new DatabaseError({
        status: 503,
        message: "Service is busy, please try again later",
        logMessage: "PostgreSQL too many connections",
        cause: error,
      });

    case "57P01":
      return new DatabaseError({
        status: 503,
        message: "Service temporarily unavailable",
        logMessage: "PostgreSQL admin shutdown",
        cause: error,
      });

    // Validation (từ DB)
    case "23502":
      return new DatabaseError({
        status: 400,
        message: "Missing required field",
        logMessage: "PostgreSQL not null violation",
        cause: error,
      });

    case "23514":
      return new DatabaseError({
        status: 422,
        message: "Request violates business rules",
        logMessage: "PostgreSQL check constraint violation",
        cause: error,
      });

    case "22P02":
      return new DatabaseError({
        status: 400,
        message: "Invalid input format",
        logMessage: "PostgreSQL invalid text representation",
        cause: error,
      });

    case "22001":
      return new DatabaseError({
        status: 400,
        message: "Input value is too long",
        logMessage: "PostgreSQL string data right truncation",
        cause: error,
      });

    case "22003":
      return new DatabaseError({
        status: 400,
        message: "Numeric value out of range",
        logMessage: "PostgreSQL numeric value out of range",
        cause: error,
      });

    // Conflict
    case "23505":
      return new DatabaseError({
        status: 409,
        message: "Resource already exists",
        logMessage: "PostgreSQL unique violation",
        cause: error,
      });

    case "23503":
      return new DatabaseError({
        status: 409,
        message: "Related resource not found",
        logMessage: "PostgreSQL foreign key violation",
        cause: error,
      });

    // Transaction
    case "40001":
    case "40P01":
      return new DatabaseError({
        status: 409,
        message: "Request conflict, please retry",
        logMessage: "PostgreSQL transaction conflict",
        cause: error,
      });

    default:
      return new DatabaseError({
        status: 500,
        message: "Internal server error",
        logMessage: "Unknown PostgreSQL error",
        cause: error,
      });
  }
}

export function handleError(err: any, corsHeaders: any) {
  if (err instanceof ValidateError) {
    logger.error(err.message);
    return new Response(
      JSON.stringify({
        code: err.code,
        message: err.message,
      }),
      {
        status: err.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      }
    );
  }

  if (err instanceof DatabaseError) {
    logger.error(err.logMessage);
    return new Response(
      JSON.stringify({
        code: err.code,
        message: err.message,
      }),
      {
        status: err.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      }
    );
  }

  if (err instanceof DomainError) {
    logger.error(err.message);
    return new Response(
      JSON.stringify({
        code: err.code,
        message: err.message,
      }),
      {
        status: err.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "x-request-id": logger.requestId,
        },
      }
    );
  }
}

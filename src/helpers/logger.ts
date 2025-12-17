export enum LogLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export enum TraceOutcome {
  SUCCESS = "success",
  FAILURE = "failure",
}

export enum ErrorCategory {
  PARSE = "parse",
  AUTH = "auth",
  VALIDATION = "validation",
  CONFLICT = "conflict",
  INFRA = "infra",
  WEBSOCKET = "websocket",
  UNKNOWN = "unknown",
}

export type BaseLogger = {
  endpoint: string;
  requestId: string;
  event: string;
  reason?: string;
  timestamp: string;
};

export interface SuccessLogger extends BaseLogger {
  level: LogLevel.INFO;
  traceOutcome: TraceOutcome.SUCCESS;
  status: number;
  durationMs: number;
}

export interface ErrorLogger extends BaseLogger {
  level: LogLevel.WARN | LogLevel.ERROR;
  traceOutcome: TraceOutcome.FAILURE;
  category: ErrorCategory;
  status: number;
}

export function Logger(input: SuccessLogger | ErrorLogger) {
  switch (input.traceOutcome) {
    case TraceOutcome.SUCCESS:
      // input is SuccessLogger
      console.info(input);
      break;

    case TraceOutcome.FAILURE:
      // input is ErrorLogger
      if (input.level === LogLevel.ERROR) {
        console.error(input);
      } else {
        console.warn(input);
      }
      break;
  }
}

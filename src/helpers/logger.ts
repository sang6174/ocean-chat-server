import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  requestId: string;
  method: string;
  path: string;
  startTime: number;
  userId?: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

export type LogLevel = "info" | "warn" | "error" | "debug";

type LogMeta = Record<string, unknown>;

class Logger {
  private shouldLog(level: LogLevel) {
    const envLevel = process.env.LOG_LEVEL ?? "info";
    const order = ["debug", "info", "warn", "error"];
    return order.indexOf(level) >= order.indexOf(envLevel);
  }

  log(level: LogLevel, message: string, meta?: LogMeta) {
    if (!this.shouldLog(level)) return;

    const ctx = getRequestContext();

    const logEvent = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: ctx?.requestId,
      method: ctx?.method,
      path: ctx?.path,
      userId: ctx?.userId,
      ...meta,
    };

    console.log(JSON.stringify(logEvent));
  }

  get requestId(): string | undefined {
    return getRequestContext()?.requestId;
  }

  debug(msg: string, meta?: LogMeta) {
    this.log("debug", msg, meta);
  }

  info(msg: string, meta?: LogMeta) {
    this.log("info", msg, meta);
  }

  warn(msg: string, meta?: LogMeta) {
    this.log("warn", msg, meta);
  }

  error(msg: string, meta?: LogMeta) {
    this.log("error", msg, meta);
  }
}

export const logger = new Logger();

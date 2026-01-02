import { getRequestContext } from "./contexts";

export type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const envLevel = process.env.LOG_LEVEL!;
    const order: LogLevel[] = ["debug", "info", "warn", "error"];
    return order.indexOf(level) >= order.indexOf(envLevel as LogLevel);
  }

  private baseLog(level: LogLevel, message: string, meta?: LogMeta) {
    if (!this.shouldLog(level)) return;

    const ctx = getRequestContext();

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: ctx?.requestId,
      userId: ctx?.userId,
      tabId: ctx?.tabId,
      method: ctx?.method,
      path: ctx?.path,
      ...meta,
    };

    console.log(JSON.stringify(logEntry));
  }

  debug(msg: string, meta?: LogMeta) {
    this.baseLog("debug", msg, meta);
  }

  info(msg: string, meta?: LogMeta) {
    this.baseLog("info", msg, meta);
  }

  warn(msg: string, meta?: LogMeta) {
    this.baseLog("warn", msg, meta);
  }

  error(msg: string, meta?: LogMeta) {
    this.baseLog("error", msg, meta);
  }
}

export const logger = new Logger();

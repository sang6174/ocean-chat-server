import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  method: string;
  path: string;
  requestId: string;
  tabId?: string;
  userId?: string;
  startTime: number;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

export class RequestContextAccessor {
  static get(): RequestContext | undefined {
    return requestContextStorage.getStore();
  }

  static getMethod(): string | undefined {
    return this.get()?.method;
  }

  static getPath(): string | undefined {
    return this.get()?.path;
  }

  static getRequestId(): string | undefined {
    return this.get()?.requestId;
  }

  static getUserId(): string | undefined {
    return this.get()?.userId;
  }

  static getTabId(): string | undefined {
    return this.get()?.tabId;
  }

  static getStartTime(): number | undefined {
    return this.get()?.startTime;
  }
}

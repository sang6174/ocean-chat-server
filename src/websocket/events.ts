import { WsServerEvent } from "../types/domain";
import type { EventCallback } from "../types/domain";
import { debounceWs, wsDebounceKey } from "./debounce";

const listeners = new Map<WsServerEvent, Set<EventCallback<any>>>();
const debounceListeners = new Map<WsServerEvent, Set<EventCallback<any>>>();

export const eventBusServer = {
  on<T>(event: WsServerEvent, callback: EventCallback<T>) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(callback);
  },

  onDebounced<T>(event: WsServerEvent, callback: EventCallback<T>) {
    if (!debounceListeners.has(event)) {
      debounceListeners.set(event, new Set());
    }
    debounceListeners.get(event)!.add(callback);
  },

  off<T>(event: WsServerEvent, callback: EventCallback<T>) {
    listeners.get(event)?.delete(callback);
    debounceListeners.get(event)?.delete(callback);
  },

  emit<T>(event: WsServerEvent, payload: T) {
    listeners.get(event)?.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });

    debounceListeners.get(event)?.forEach((cb) => {
      try {
        const key = this.extractDebounceKey(event, payload);
        debounceWs(key, () => cb(payload));
      } catch (err) {
        console.error(`Error in debounced event listener for ${event}:`, err);
      }
    });
  },

  extractDebounceKey<T>(event: WsServerEvent, payload: T): string {
    const p = payload as any;
    const recipients = p?.recipients ?? (p?.recipient ? [p.recipient] : []);
    return wsDebounceKey(event, recipients);
  },
};

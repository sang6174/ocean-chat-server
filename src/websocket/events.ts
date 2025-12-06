import { WsServerEvent } from "../types/domain";
import type { EventCallback } from "../types/domain";

const listeners = new Map<WsServerEvent, Set<EventCallback<any>>>();

export const eventBusServer = {
  // Subscribe
  on<T>(event: WsServerEvent, callback: EventCallback<T>) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }

    listeners.get(event)!.add(callback);
  },

  // Unsubscribe
  off<T>(event: WsServerEvent, callback: EventCallback<T>) {
    listeners.get(event)?.delete(callback);
  },

  // Publish
  emit<T>(event: WsServerEvent, payload: T) {
    listeners.get(event)?.forEach((callback) => {
      try {
        callback(payload);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  },
};

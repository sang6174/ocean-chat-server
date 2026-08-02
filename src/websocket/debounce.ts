import { env } from "../configs/env";

type DebounceKey = string;

const debounceTimers = new Map<DebounceKey, ReturnType<typeof setTimeout>>();

export function debounceWs(
  key: DebounceKey,
  fn: () => void,
  delayMs: number = env.wsDebounceMs
): void {
  const existing = debounceTimers.get(key);
  if (existing) {
    clearTimeout(existing);
  }
  debounceTimers.set(
    key,
    setTimeout(() => {
      debounceTimers.delete(key);
      fn();
    }, delayMs)
  );
}

export function wsDebounceKey(
  eventType: string,
  recipients: { id: string }[]
): string {
  return `${eventType}:${recipients.map((r) => r.id).sort().join(",")}`;
}

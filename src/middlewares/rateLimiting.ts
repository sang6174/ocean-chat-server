import { env } from "../configs/env";

interface RateLimitStore {
  check(key: string): Promise<boolean> | boolean;
  getStatus(key: string): Promise<{ remaining: number; reset: number }> | { remaining: number; reset: number };
}

class InMemoryRateLimitStore implements RateLimitStore {
  private entries = new Map<string, { requests: number[] }>();

  constructor() {
    setInterval(() => this.cleanup(), env.rateLimitCleanupIntervalMs);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.entries) {
      entry.requests = entry.requests.filter((t) => now - t < env.rateLimitWindowMs);
      if (entry.requests.length === 0) {
        this.entries.delete(key);
      }
    }
  }

  check(key: string): boolean {
    const now = Date.now();
    if (!this.entries.has(key)) {
      this.entries.set(key, { requests: [now] });
      return true;
    }
    const entry = this.entries.get(key)!;
    entry.requests = entry.requests.filter((t) => now - t < env.rateLimitWindowMs);
    if (entry.requests.length >= env.rateLimitMaxRequests) {
      return false;
    }
    entry.requests.push(now);
    return true;
  }

  getStatus(key: string): { remaining: number; reset: number } {
    const now = Date.now();
    const entry = this.entries.get(key);
    if (!entry) {
      return { remaining: env.rateLimitMaxRequests, reset: now + env.rateLimitWindowMs };
    }
    const valid = entry.requests.filter((t) => now - t < env.rateLimitWindowMs).length;
    return {
      remaining: Math.max(0, env.rateLimitMaxRequests - valid),
      reset: entry.requests.length > 0 ? entry.requests[0]! + env.rateLimitWindowMs : now + env.rateLimitWindowMs,
    };
  }
}

class RedisRateLimitStore implements RateLimitStore {
  private client: any;
  private ready: boolean = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const { default: Redis } = await import("ioredis");
      this.client = new Redis(env.redisUrl, {
        lazyConnect: true,
        retryStrategy: () => null,
        maxRetriesPerRequest: 0,
      });
      await this.client.connect();
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  async check(key: string): Promise<boolean> {
    if (!this.ready || !this.client) return true;
    try {
      const now = Date.now();
      const windowStart = now - env.rateLimitWindowMs;
      const multi = this.client.multi();
      multi.zremrangebyscore(key, 0, windowStart);
      multi.zcard(key);
      const [, count] = (await multi.exec()) as [[null, number], [null, number]];
      if (count[1]! >= env.rateLimitMaxRequests) return false;
      await this.client.zadd(key, now, `${now}-${Math.random()}`);
      await this.client.pexpire(key, env.rateLimitWindowMs);
      return true;
    } catch {
      return true;
    }
  }

  async getStatus(key: string): Promise<{ remaining: number; reset: number }> {
    if (!this.ready || !this.client) {
      return { remaining: env.rateLimitMaxRequests, reset: Date.now() + env.rateLimitWindowMs };
    }
    try {
      const now = Date.now();
      const windowStart = now - env.rateLimitWindowMs;
      const multi = this.client.multi();
      multi.zremrangebyscore(key, 0, windowStart);
      multi.zcard(key);
      const [, count] = (await multi.exec()) as [[null, number], [null, number]];
      return {
        remaining: Math.max(0, env.rateLimitMaxRequests - (count[1] ?? 0)),
        reset: now + env.rateLimitWindowMs,
      };
    } catch {
      return { remaining: env.rateLimitMaxRequests, reset: Date.now() + env.rateLimitWindowMs };
    }
  }
}

const store: RateLimitStore = env.redisUrl
  ? new RedisRateLimitStore()
  : new InMemoryRateLimitStore();

export function getRateLimitKey(req: Request): string {
  const forwarded = req.headers.get("X-Forwarded-For");
  const ip = forwarded ? forwarded.split(",")[0]!.trim() : "unknown";
  return `ratelimit:${ip}`;
}

function getStatusSync(key: string): { remaining: number; reset: number } {
  if (store instanceof InMemoryRateLimitStore) {
    return store.getStatus(key) as { remaining: number; reset: number };
  }
  return { remaining: env.rateLimitMaxRequests, reset: Date.now() + env.rateLimitWindowMs };
}

export function checkRateLimit(key: string): boolean {
  const result = store.check(key);
  if (typeof result === "boolean") return result;
  return true;
}

export async function checkRateLimitAsync(key: string): Promise<boolean> {
  const result = store.check(key);
  if (typeof result === "boolean") return result;
  return result;
}

export function getRateLimitStatus(key: string): { remaining: number; reset: number } {
  const result = store.getStatus(key);
  if ("then" in result) return getStatusSync(key);
  return result;
}

export { store as rateLimitStore };

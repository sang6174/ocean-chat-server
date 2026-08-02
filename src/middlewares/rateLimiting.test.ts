import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  getRateLimitKey,
  getRateLimitStatus,
} from "./rateLimiting";

describe("getRateLimitKey", () => {
  it("extracts IP from X-Forwarded-For", () => {
    const req = new Request("http://localhost/", {
      headers: { "X-Forwarded-For": "192.168.1.1, 10.0.0.1" },
    });
    expect(getRateLimitKey(req)).toBe("ratelimit:192.168.1.1");
  });

  it("falls back to unknown", () => {
    const req = new Request("http://localhost/");
    expect(getRateLimitKey(req)).toBe("ratelimit:unknown");
  });
});

describe("checkRateLimit", () => {
  const key = "ratelimit:test-127.0.0.1";

  it("allows first request", () => {
    const key2 = key + "-first";
    expect(checkRateLimit(key2)).toBe(true);
  });

  it("returns status with remaining count", () => {
    const key3 = key + "-status";
    const status = getRateLimitStatus(key3);
    expect(status.remaining).toBeGreaterThanOrEqual(0);
    expect(typeof status.reset).toBe("number");
  });

  it("blocks after exceeding limit", () => {
    const key4 = key + "-block";
    for (let i = 0; i < 60; i++) {
      checkRateLimit(key4);
    }
    expect(checkRateLimit(key4)).toBe(false);
  });
});

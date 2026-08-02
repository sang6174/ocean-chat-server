import { describe, it, expect } from "vitest";
import { hashRefreshToken } from "./helpers";

describe("hashRefreshToken", () => {
  it("returns a 64-char hex string", () => {
    const hash = hashRefreshToken("test-token");
    expect(hash).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
  });

  it("produces deterministic output", () => {
    const a = hashRefreshToken("same-token");
    const b = hashRefreshToken("same-token");
    expect(a).toBe(b);
  });

  it("produces different hashes for different inputs", () => {
    const a = hashRefreshToken("token-a");
    const b = hashRefreshToken("token-b");
    expect(a).not.toBe(b);
  });
});

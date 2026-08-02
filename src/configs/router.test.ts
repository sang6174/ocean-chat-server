import { describe, it, expect } from "vitest";
import { router } from "./router";

describe("Router", () => {
  it("matches exact paths", () => {
    let called = false;
    router.post("/v1/test/hello", (_req, _headers, _params) => {
      called = true;
      return new Response("ok");
    });

    const result = router.match("POST", "/v1/test/hello");
    expect(result).not.toBeNull();
    expect(result!.params).toEqual({});
  });

  it("returns null for non-matching path", () => {
    const result = router.match("POST", "/v1/nonexistent");
    expect(result).toBeNull();
  });

  it("returns null for wrong method", () => {
    const result = router.match("GET", "/v1/auth/register");
    expect(result).toBeNull();
  });

  it("returns null for partially matching path", () => {
    const result = router.match("POST", "/v1/auth");
    expect(result).toBeNull();
  });
});

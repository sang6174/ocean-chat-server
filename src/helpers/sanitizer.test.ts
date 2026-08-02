import { describe, it, expect } from "vitest";
import {
  sanitizeMessage,
  sanitizeText,
  sanitizeConversationName,
  sanitizeUsername,
} from "./sanitizer";

describe("sanitizeMessage", () => {
  it("returns empty string for non-string input", () => {
    expect(sanitizeMessage(123 as any)).toBe("");
    expect(sanitizeMessage(null as any)).toBe("");
    expect(sanitizeMessage(undefined as any)).toBe("");
  });

  it("encodes HTML special characters", () => {
    expect(sanitizeMessage('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
    expect(sanitizeMessage("< > \" '")).toBe("&lt; &gt; &quot; &#x27;");
  });

  it("trims whitespace", () => {
    expect(sanitizeMessage("  hello  ")).toBe("hello");
  });

  it("returns normal text unchanged", () => {
    expect(sanitizeMessage("Hello World!")).toBe("Hello World!");
    expect(sanitizeMessage("Xin chào")).toBe("Xin chào");
  });
});

describe("sanitizeText", () => {
  it("strips HTML characters", () => {
    expect(sanitizeText('<b>bold</b>')).toBe("bbold/b");
    expect(sanitizeText('test"quote`backtick')).toBe("testquotebacktick");
  });

  it("truncates to max length", () => {
    expect(sanitizeText("abcdef", 3)).toBe("abc");
  });

  it("returns empty for non-string", () => {
    expect(sanitizeText(123 as any)).toBe("");
  });
});

describe("sanitizeConversationName", () => {
  it("truncates to 100 chars", () => {
    const long = "a".repeat(200);
    expect(sanitizeConversationName(long).length).toBe(100);
  });
});

describe("sanitizeUsername", () => {
  it("lowercases and truncates to 32", () => {
    expect(sanitizeUsername("SANG")).toBe("sang");
    const long = "A".repeat(50);
    expect(sanitizeUsername(long).length).toBe(32);
  });
});

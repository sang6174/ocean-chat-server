import { describe, it, expect } from "vitest";
import {
  isNumber,
  isString,
  isPlainObject,
  isUUIDv4,
  isName,
  isUsername,
  isEmail,
  isPassword,
  isTypeConversationEnum,
} from "./helper";
import { ConversationType } from "../../types/domain";

describe("isNumber", () => {
  it("returns true for numbers", () => {
    expect(isNumber(42)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber(-1)).toBe(true);
    expect(isNumber(3.14)).toBe(true);
  });

  it("returns false for non-numbers", () => {
    expect(isNumber("42")).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber({})).toBe(false);
    expect(isNumber([])).toBe(false);
    expect(isNumber(NaN)).toBe(false);
  });
});

describe("isString", () => {
  it("returns true for strings", () => {
    expect(isString("hello")).toBe(true);
    expect(isString("")).toBe(true);
  });

  it("returns false for non-strings", () => {
    expect(isString(42)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString({})).toBe(false);
  });
});

describe("isPlainObject", () => {
  it("returns true for plain objects", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
  });

  it("returns false for non-objects", () => {
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject("hello")).toBe(false);
    expect(isPlainObject(42)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
  });
});

describe("isUUIDv4", () => {
  it("returns true for valid v4 UUIDs", () => {
    expect(isUUIDv4("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isUUIDv4("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(true);
  });

  it("returns false for invalid UUIDs", () => {
    expect(isUUIDv4("not-a-uuid")).toBe(false);
    expect(isUUIDv4("")).toBe(false);
    expect(isUUIDv4("550e8400-e29b-51d4-a716-446655440000")).toBe(false);
    expect(isUUIDv4("550e8400-e29b-41d4-a716-44665544000z")).toBe(false);
  });
});

describe("isName", () => {
  it("returns true for valid names", () => {
    expect(isName("Sang")).toBe(true);
    expect(isName("Nguyễn")).toBe(true);
    expect(isName("John")).toBe(true);
  });

  it("returns false for invalid names", () => {
    expect(isName("")).toBe(false);
    expect(isName("A")).toBe(false);
    expect(isName(123)).toBe(false);
    expect(isName(null)).toBe(false);
  });
});

describe("isUsername", () => {
  it("returns true for valid usernames (3-32 chars)", () => {
    expect(isUsername("sang")).toBe(true);
    expect(isUsername("user123")).toBe(true);
    expect(isUsername("a".repeat(32))).toBe(true);
  });

  it("returns false for invalid usernames", () => {
    expect(isUsername("ab")).toBe(false);
    expect(isUsername("a".repeat(33))).toBe(false);
    expect(isUsername("")).toBe(false);
    expect(isUsername(123)).toBe(false);
  });
});

describe("isEmail", () => {
  it("returns true for valid emails", () => {
    expect(isEmail("test@example.com")).toBe(true);
    expect(isEmail("a@b.co")).toBe(true);
  });

  it("returns false for invalid emails", () => {
    expect(isEmail("")).toBe(false);
    expect(isEmail("notanemail")).toBe(false);
    expect(isEmail("missing@")).toBe(false);
    expect(isEmail("@missing.com")).toBe(false);
    expect(isEmail(123)).toBe(false);
  });
});

describe("isPassword", () => {
  it("returns true for strong passwords", () => {
    expect(isPassword("StrongP@ss1")).toBe(true);
    expect(isPassword("C0mpl!cated")).toBe(true);
  });

  it("returns false for weak passwords", () => {
    expect(isPassword("weak")).toBe(false);
    expect(isPassword("nouppercase1!")).toBe(false);
    expect(isPassword("NOLOWERCASE1!")).toBe(false);
    expect(isPassword("NoSpecial1")).toBe(false);
    expect(isPassword("NoNumber!")).toBe(false);
    expect(isPassword("")).toBe(false);
    expect(isPassword(12345678)).toBe(false);
  });
});

describe("isTypeConversationEnum", () => {
  it("returns true for valid enum values", () => {
    expect(isTypeConversationEnum(ConversationType.Group)).toBe(true);
    expect(isTypeConversationEnum(ConversationType.Direct)).toBe(true);
    expect(isTypeConversationEnum(ConversationType.Myself)).toBe(true);
  });

  it("returns false for invalid values", () => {
    expect(isTypeConversationEnum("invalid")).toBe(false);
    expect(isTypeConversationEnum("")).toBe(false);
    expect(isTypeConversationEnum(42)).toBe(false);
  });
});

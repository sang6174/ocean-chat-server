import { describe, it, expect } from "vitest";
import {
  validateLogoutDomainInput,
  validateAccessToken,
  validateRefreshToken,
  validateCreateGroupConversationDomainInput,
  validateAddParticipantsDomainInput,
  validateGetProfileUserDomainInput,
  validateGetConversationsByUserIdDomainInput,
  validateGenerateAuthTokenOutput,
  validateGetProfileUserDomainOutput,
  isDecodedToken,
} from "./domain";

describe("validateLogoutDomainInput", () => {
  it("returns valid for correct input", () => {
    const result = validateLogoutDomainInput({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      refreshToken: "some-token",
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for non-UUID userId", () => {
    const result = validateLogoutDomainInput({
      userId: "not-a-uuid",
      refreshToken: "some-token",
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateAccessToken", () => {
  const validToken = {
    data: {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      username: "testuser",
    },
    iat: Math.floor(Date.now() / 1000) - 100,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  it("returns valid for correct payload", () => {
    const result = validateAccessToken(validToken as any);
    expect(result.valid).toBe(true);
  });

  it("returns invalid when expired", () => {
    const expired = {
      ...validToken,
      exp: Math.floor(Date.now() / 1000) - 1,
    };
    const result = validateAccessToken(expired as any);
    expect(result.valid).toBe(false);
    expect((result as any).message).toContain("expired");
  });

  it("returns invalid when exp <= iat", () => {
    const invalid = {
      ...validToken,
      exp: validToken.iat - 1,
    };
    const result = validateAccessToken(invalid as any);
    expect(result.valid).toBe(false);
  });

  it("returns invalid for non-UUID userId", () => {
    const invalid = {
      ...validToken,
      data: { userId: "not-uuid", username: "test" },
    };
    const result = validateAccessToken(invalid as any);
    expect(result.valid).toBe(false);
  });
});

describe("validateRefreshToken", () => {
  const validToken = {
    data: {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      jti: "550e8400-e29b-41d4-a716-446655440001",
    },
    iat: Math.floor(Date.now() / 1000) - 100,
    exp: Math.floor(Date.now() / 1000) + 86400,
  };

  it("returns valid for correct payload", () => {
    const result = validateRefreshToken(validToken as any);
    expect(result.valid).toBe(true);
  });

  it("returns invalid when expired", () => {
    const expired = {
      ...validToken,
      exp: Math.floor(Date.now() / 1000) - 1,
    };
    const result = validateRefreshToken(expired as any);
    expect(result.valid).toBe(false);
  });

  it("returns invalid for missing jti", () => {
    const invalid = {
      ...validToken,
      data: { userId: validToken.data.userId },
    };
    const result = validateRefreshToken(invalid as any);
    expect(result.valid).toBe(false);
  });
});

describe("validateCreateGroupConversationDomainInput", () => {
  const creatorId = "550e8400-e29b-41d4-a716-446655440000";

  it("returns valid when creator is in participants", () => {
    const result = validateCreateGroupConversationDomainInput({
      type: "group",
      name: "My Group",
      creator: { id: creatorId, username: "creator" },
      participantIds: [
        creatorId,
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002",
      ],
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid when creator not in participants", () => {
    const result = validateCreateGroupConversationDomainInput({
      type: "group",
      name: "My Group",
      creator: { id: creatorId, username: "creator" },
      participantIds: [
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002",
      ],
    });
    expect(result.valid).toBe(false);
    expect((result as any).message).toContain("participant");
  });

  it("returns invalid for less than 3 participants", () => {
    const result = validateCreateGroupConversationDomainInput({
      type: "group",
      name: "Pair",
      creator: { id: creatorId, username: "creator" },
      participantIds: [creatorId, "550e8400-e29b-41d4-a716-446655440001"],
    });
    expect(result.valid).toBe(false);
    expect((result as any).message).toContain("at least 3");
  });

  it("returns invalid for duplicate participants", () => {
    const result = validateCreateGroupConversationDomainInput({
      type: "group",
      name: "Dup",
      creator: { id: creatorId, username: "creator" },
      participantIds: [
        creatorId,
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440001",
      ],
    });
    expect(result.valid).toBe(false);
    expect((result as any).message).toContain("Duplicate");
  });
});

describe("validateAddParticipantsDomainInput", () => {
  it("returns valid for unique participants", () => {
    const result = validateAddParticipantsDomainInput({
      creator: { id: "a", username: "creator" },
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      participantIds: [
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002",
      ],
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for duplicate participants", () => {
    const result = validateAddParticipantsDomainInput({
      creator: { id: "a", username: "creator" },
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      participantIds: [
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440001",
      ],
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateGetProfileUserDomainInput", () => {
  it("returns valid for correct input", () => {
    const result = validateGetProfileUserDomainInput({
      userId: "some-user-id",
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for non-object", () => {
    const result = validateGetProfileUserDomainInput("not-object");
    expect(result.valid).toBe(false);
  });
});

describe("validateGetConversationsByUserIdDomainInput", () => {
  it("returns valid for correct input", () => {
    const result = validateGetConversationsByUserIdDomainInput({
      userId: "some-user-id",
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for missing userId", () => {
    const result = validateGetConversationsByUserIdDomainInput({});
    expect(result.valid).toBe(false);
  });
});

describe("validateGenerateAuthTokenOutput", () => {
  it("returns valid for correct output", () => {
    const result = validateGenerateAuthTokenOutput({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      username: "testuser",
      accessToken: "access-token-string",
      refreshToken: "refresh-token-string",
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for missing refreshToken", () => {
    const result = validateGenerateAuthTokenOutput({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      username: "testuser",
      accessToken: "access-token-string",
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateGetProfileUserDomainOutput", () => {
  it("returns valid for correct output", () => {
    const result = validateGetProfileUserDomainOutput({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test User",
      email: "test@example.com",
      username: "testuser",
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for bad email", () => {
    const result = validateGetProfileUserDomainOutput({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test User",
      email: "notanemail",
      username: "testuser",
    });
    expect(result.valid).toBe(false);
  });
});

describe("isDecodedToken", () => {
  it("returns true for valid token shape", () => {
    expect(
      isDecodedToken({
        data: "some-data",
        iat: 12345,
        exp: 12345 + 3600,
      })
    ).toBe(true);
  });

  it("returns false for non-object", () => {
    expect(isDecodedToken("not-a-token")).toBe(false);
  });

  it("returns false for missing fields", () => {
    expect(isDecodedToken({ data: "x" })).toBe(false);
  });
});

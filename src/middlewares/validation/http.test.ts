import { describe, it, expect } from "vitest";
import {
  validateHttpRegisterPost,
  validateHttpLoginPost,
  validateHttpLoginPostResponse,
  validateHttpFriendRequest,
  validateHttpFriendRequestWithNotificationId,
  validateHttpSendMessagePost,
  validateHttpCreateGroupConversationPost,
  validateHttpAddParticipantsPost,
} from "./http";

describe("validateHttpRegisterPost", () => {
  it("returns valid for correct input", () => {
    const result = validateHttpRegisterPost({
      name: "Test User",
      email: "test@example.com",
      username: "testuser",
      password: "StrongP@ss1",
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for missing name", () => {
    const result = validateHttpRegisterPost({
      email: "test@example.com",
      username: "testuser",
      password: "StrongP@ss1",
    });
    expect(result.valid).toBe(false);
    expect((result as any).message).toContain("Name");
  });

  it("returns invalid for bad email", () => {
    const result = validateHttpRegisterPost({
      name: "Test",
      email: "notanemail",
      username: "testuser",
      password: "StrongP@ss1",
    });
    expect(result.valid).toBe(false);
  });

  it("returns invalid for weak password", () => {
    const result = validateHttpRegisterPost({
      name: "Test",
      email: "test@example.com",
      username: "testuser",
      password: "weak",
    });
    expect(result.valid).toBe(false);
  });

  it("returns invalid for non-object", () => {
    const result = validateHttpRegisterPost("string");
    expect(result.valid).toBe(false);
  });
});

describe("validateHttpLoginPost", () => {
  it("returns valid for correct input", () => {
    const result = validateHttpLoginPost({
      username: "testuser",
      password: "StrongP@ss1",
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for short username", () => {
    const result = validateHttpLoginPost({
      username: "ab",
      password: "StrongP@ss1",
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateHttpLoginPostResponse", () => {
  it("returns valid for correct output", () => {
    const result = validateHttpLoginPostResponse({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      username: "testuser",
      accessToken: "eyJhbGciOiJIUzI1NiIs...",
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for missing accessToken", () => {
    const result = validateHttpLoginPostResponse({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      username: "testuser",
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateHttpFriendRequest", () => {
  it("returns valid for correct input", () => {
    const result = validateHttpFriendRequest({
      recipient: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        username: "otheruser",
      },
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for missing recipient.id", () => {
    const result = validateHttpFriendRequest({
      recipient: { username: "otheruser" },
    });
    expect(result.valid).toBe(false);
  });

  it("returns invalid for non-UUID recipient.id", () => {
    const result = validateHttpFriendRequest({
      recipient: { id: "not-a-uuid", username: "otheruser" },
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateHttpFriendRequestWithNotificationId", () => {
  it("returns valid for correct input", () => {
    const result = validateHttpFriendRequestWithNotificationId({
      recipient: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        username: "otheruser",
      },
      notificationId: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for missing notificationId", () => {
    const result = validateHttpFriendRequestWithNotificationId({
      recipient: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        username: "otheruser",
      },
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateHttpSendMessagePost", () => {
  it("returns valid for correct input", () => {
    const result = validateHttpSendMessagePost({
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      message: "Hello world",
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for empty message", () => {
    const result = validateHttpSendMessagePost({
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      message: "   ",
    });
    expect(result.valid).toBe(false);
  });

  it("returns invalid for message exceeding 5000 chars", () => {
    const result = validateHttpSendMessagePost({
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      message: "a".repeat(5001),
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateHttpCreateGroupConversationPost", () => {
  it("returns valid for correct input", () => {
    const result = validateHttpCreateGroupConversationPost({
      conversation: { name: "My Group" },
      participantIds: [
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002",
      ],
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for > 100 participants", () => {
    const ids = Array.from({ length: 101 }, () =>
      "550e8400-e29b-41d4-a716-446655440000"
    );
    const result = validateHttpCreateGroupConversationPost({
      conversation: { name: "Big Group" },
      participantIds: ids,
    });
    expect(result.valid).toBe(false);
  });

  it("returns invalid for non-UUID participant", () => {
    const result = validateHttpCreateGroupConversationPost({
      conversation: { name: "Bad Group" },
      participantIds: ["not-a-uuid", "550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"],
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateHttpAddParticipantsPost", () => {
  it("returns valid for correct input", () => {
    const result = validateHttpAddParticipantsPost({
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      participantIds: [
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002",
      ],
    });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for > 50 participants", () => {
    const ids = Array.from({ length: 51 }, () =>
      "550e8400-e29b-41d4-a716-446655440000"
    );
    const result = validateHttpAddParticipantsPost({
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      participantIds: ids,
    });
    expect(result.valid).toBe(false);
  });
});

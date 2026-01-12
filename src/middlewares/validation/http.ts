import type {
  HttpRegisterPost,
  HttpLoginPost,
  HttpLoginPostResponse,
  HttpCreateGroupConversationPost,
  HttpSendMessagePost,
  HttpAddParticipantsPost,
  HttpFriendRequest,
  HttpFriendRequestWithNotificationId,
} from "../../types/http";
import {
  isName,
  isEmail,
  isPassword,
  isPlainObject,
  isUsername,
  isString,
  assertValidInput,
  isUUIDv4,
  assertValidOutput,
} from "./helper";

// Http register post
export function validateHttpRegisterPost(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Invalid request format." };

  if (!isName(value.name))
    return { valid: false, message: "Name is required." };

  if (!isEmail(value.email))
    return { valid: false, message: "Email is invalid." };

  if (!isUsername(value.username))
    return {
      valid: false,
      message: "Username must be between 3 and 32 characters.",
    };

  if (!isPassword(value.password))
    return {
      valid: false,
      message: "Password must be at least 6 characters.",
    };

  return { valid: true };
}

export function assertHttpRegisterPost(
  value: any
): asserts value is HttpRegisterPost {
  assertValidInput(validateHttpRegisterPost(value), "HttpRegisterPost");
}

// Http login post
export function validateHttpLoginPost(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Invalid request format." };

  if (!isUsername(value.username))
    return {
      valid: false,
      message: "Username must be between 3 and 32 characters.",
    };

  if (!isPassword(value.password))
    return {
      valid: false,
      message: "Password must be at least 6 characters.",
    };

  return { valid: true };
}

export function assertHttpLoginPost(
  value: any
): asserts value is HttpLoginPost {
  assertValidInput(validateHttpLoginPost(value), "HttpLoginPost");
}

// Http login post response
export function validateHttpLoginPostResponse(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be a object" };

  if (!isUUIDv4(value.userId))
    return { valid: false, message: "userId must be a uuidv4" };

  if (!isUsername(value.username))
    return { valid: false, message: "username must be valid username" };

  if (!isString(value.accessToken))
    return { valid: false, message: "accessToken must be a string" };

  return { valid: true };
}

export function assertHttpLoginPostResponse(
  value: any
): asserts value is HttpLoginPostResponse {
  assertValidOutput(
    validateHttpLoginPostResponse(value),
    "HttpLoginPostResponse"
  );
}

// Http create group conversation post
export function validateHttpCreateGroupConversationPost(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Invalid request format." };

  const con = value.conversation;
  if (typeof con !== "object" || con === null)
    return { valid: false, message: "Conversation data is missing." };

  if (!isString(con.name))
    return {
      valid: false,
      message: "Group name is required.",
    };

  if (!Array.isArray(value.participantIds)) {
    return {
      valid: false,
      message: "Participants list is invalid.",
    };
  }

  for (const p of value.participantIds) {
    if (!isUUIDv4(p)) {
      return {
        valid: false,
        message: "One or more participants are invalid.",
      };
    }
  }

  return { valid: true };
}

export function assertHttpCreateGroupConversationPost(
  value: any
): asserts value is HttpCreateGroupConversationPost {
  assertValidInput(
    validateHttpCreateGroupConversationPost(value),
    "HttpCreateGroupConversationPost"
  );
}

// Http send message post
export function validateHttpSendMessagePost(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isUUIDv4(value.conversationId))
    return { valid: false, message: "conversationId must be uuidv4" };

  if (!isString(value.message))
    return { valid: false, message: "message must be string" };

  return { valid: true };
}

export function assertHttpSendMessagePost(
  value: any
): asserts value is HttpSendMessagePost {
  assertValidInput(validateHttpSendMessagePost(value), "HttpSendMessagePost");
}

// Http add participants post
export function validateHttpAddParticipantsPost(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Invalid request format." };

  if (!isUUIDv4(value.conversationId))
    return { valid: false, message: "Invalid conversation ID." };

  if (!Array.isArray(value.participantIds))
    return { valid: false, message: "Participants list is invalid." };

  for (const i of value.participantIds) {
    if (!isUUIDv4(i)) {
      return { valid: false, message: "One or more participants are invalid." };
    }
  }

  return { valid: true };
}

export function assertHttpAddParticipantsPost(
  value: any
): asserts value is HttpAddParticipantsPost {
  assertValidInput(
    validateHttpAddParticipantsPost(value),
    "HttpAddParticipantsPost"
  );
}

// Http friend request
export function validateHttpFriendRequest(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Invalid request format." };

  if (!isPlainObject(value.recipient))
    return { valid: false, message: "Recipient data is missing." };

  if (!isUUIDv4(value.recipient.id))
    return { valid: false, message: "Invalid recipient ID." };

  if (!isString(value.recipient.username))
    return { valid: false, message: "Invalid recipient username." };

  return { valid: true };
}

export function assertHttpFriendRequest(
  value: any
): asserts value is HttpFriendRequest {
  assertValidInput(validateHttpFriendRequest(value), "HttpFriendRequest");
}

// Http friend request with notification id
export function validateHttpFriendRequestWithNotificationId(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Invalid request format." };

  if (!isPlainObject(value.recipient))
    return { valid: false, message: "Recipient data is missing." };

  if (!isUUIDv4(value.recipient.id))
    return { valid: false, message: "Invalid recipient ID." };

  if (!isString(value.recipient.username))
    return { valid: false, message: "Invalid recipient username." };

  if (!isUUIDv4(value.notificationId))
    return { valid: false, message: "Invalid notification ID." };

  return { valid: true };
}

export function assertHttpFriendRequestWithNotificationId(
  value: any
): asserts value is HttpFriendRequestWithNotificationId {
  assertValidInput(
    validateHttpFriendRequestWithNotificationId(value),
    "HttpFriendRequestWithNotificationId"
  );
}

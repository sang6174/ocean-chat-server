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
    return { valid: false, message: "Must be an object" };

  if (!isName(value.name))
    return { valid: false, message: "name must be string" };

  if (!isEmail(value.email))
    return { valid: false, message: "email must be string" };

  if (!isUsername(value.username))
    return { valid: false, message: "username must be string" };

  if (!isPassword(value.password))
    return { valid: false, message: "password must be string" };

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
    return { valid: false, message: "Must be an object" };

  if (!isUsername(value.username))
    return { valid: false, message: "username must be string" };

  if (!isPassword(value.password))
    return { valid: false, message: "password must be string" };

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
    return { valid: false, message: "Must be an object" };

  const con = value.conversation;
  if (typeof con !== "object" || con === null)
    return { valid: false, message: "conversation must be object" };

  if (!isString(con.name))
    return {
      valid: false,
      message: "conversation.name must be string",
    };

  if (!Array.isArray(value.participantIds)) {
    return {
      valid: false,
      message: "participantIds must be array",
    };
  }

  for (const p of value.participantIds) {
    if (!isUUIDv4(p)) {
      return {
        valid: false,
        message: "participantIds[i] must be uuidv4",
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
    return { valid: false, message: "Must be an object" };

  if (!isUUIDv4(value.conversationId))
    return { valid: false, message: "conversationId must be uuidv4" };

  if (!Array.isArray(value.participantIds))
    return { valid: false, message: "participantIds must be array" };

  for (const i of value.participantIds) {
    if (!isUUIDv4(i)) {
      return { valid: false, message: "participantIds[i] must be uuidv4[]" };
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
    return { valid: false, message: "Must be an object" };

  if (!isPlainObject(value.recipient))
    return { valid: false, message: "recipient must be object" };

  if (!isUUIDv4(value.recipient.id))
    return { valid: false, message: "recipient.id must be uuidv4" };

  if (!isString(value.recipient.username))
    return { valid: false, message: "recipient.username must be string" };

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
    return { valid: false, message: "Must be an object" };

  if (!isPlainObject(value.recipient))
    return { valid: false, message: "recipient must be object" };

  if (!isUUIDv4(value.recipient.id))
    return { valid: false, message: "recipient.id must be uuidv4" };

  if (!isString(value.recipient.username))
    return { valid: false, message: "recipient.username must be string" };

  if (!isUUIDv4(value.notificationId))
    return { valid: false, message: "notificationId must be uuidv4" };

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

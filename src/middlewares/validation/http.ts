import type {
  HttpRegisterPost,
  HttpLoginPost,
  HttpCreateConversationPost,
  HttpSendMessagePost,
  HttpAddParticipantPost,
  HttpNotificationFriendPost,
} from "../../types/http";
import {
  isName,
  isEmail,
  isPassword,
  isPlainObject,
  isUsername,
  isString,
  isStringArray,
  assertValid,
  isUUIDv4,
} from "./helper";

// ============================================================
// HTTP Input Validation
// ============================================================
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
  assertValid(validateHttpRegisterPost(value), "HttpRegisterPost");
}

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
  assertValid(validateHttpLoginPost(value), "HttpLoginPost");
}

export function validateHttpCreateConversationPost(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  const con = value.conversation;
  if (typeof con !== "object" || con === null)
    return { valid: false, message: "conversation must be object" };

  if (!isString(con.type))
    return { valid: false, message: "conversation.type must be string" };

  if (typeof con.metadata !== "object" || con.metadata === null)
    return { valid: false, message: "conversation.metadata must be object" };

  if (!isString(con.metadata.name))
    return {
      valid: false,
      message: "conversation.metadata.name must be string",
    };

  return { valid: true };
}

export function assertHttpCreateConversationPost(
  value: any
): asserts value is HttpCreateConversationPost {
  assertValid(
    validateHttpCreateConversationPost(value),
    "HttpCreateConversationPost"
  );
}

export function validateHttpSendMessagePost(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isUUIDv4(value.conversationId))
    return { valid: false, message: "conversationId must be string" };

  if (!isPlainObject(value.sender))
    return { valid: false, message: "sender must be object" };

  if (!isUUIDv4(value.sender.id))
    return { valid: false, message: "sender.id must be string" };

  if (!isString(value.sender.username))
    return { valid: false, message: "sender.username must be string" };

  if (!isString(value.message))
    return { valid: false, message: "message must be string" };

  return { valid: true };
}

export function assertHttpSendMessagePost(
  value: any
): asserts value is HttpSendMessagePost {
  assertValid(validateHttpSendMessagePost(value), "HttpSendMessagePost");
}

export function validateHttpAddParticipantPost(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isUUIDv4(value.conversationId))
    return { valid: false, message: "conversationId must be string" };

  if (!isPlainObject(value.creator))
    return { valid: false, message: "creator must be object" };

  if (!isUUIDv4(value.creator.id))
    return { valid: false, message: "creator.id must be string" };

  if (!isString(value.creator.username))
    return { valid: false, message: "creator.username must be string" };

  if (!isStringArray(value.participantIds))
    return { valid: false, message: "participantIds must be uuidv4[]" };

  for (const i of value.participantIds) {
    if (!isUUIDv4(i)) {
      return { valid: false, message: "participantIds must be uuidv4[]" };
    }
  }

  return { valid: true };
}

export function assertHttpAddParticipantPost(
  value: any
): asserts value is HttpAddParticipantPost {
  assertValid(validateHttpAddParticipantPost(value), "HttpAddParticipantPost");
}

export function validateHttpNotificationFriendPost(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isPlainObject(value.sender))
    return { valid: false, message: "sender must be object" };

  if (!isUUIDv4(value.sender.id))
    return { valid: false, message: "sender.id must be uuidv4" };

  if (!isString(value.sender.username)) {
    return { valid: false, message: "sender.username must be string" };
  }

  if (!isPlainObject(value.recipient))
    return { valid: false, message: "recipient must be object" };

  if (!isUUIDv4(value.recipient.id))
    return { valid: false, message: "recipient.id must be uuidv4" };

  if (!isString(value.recipient.username)) {
    return { valid: false, message: "recipient.username must be string" };
  }

  return { valid: true };
}

export function assertHttpNotificationFriendPost(
  value: any
): asserts value is HttpNotificationFriendPost {
  assertValid(
    validateHttpNotificationFriendPost(value),
    "HttpNotificationFriendPost"
  );
}

import type {
  PublishConversationCreated,
  PublishMessageCreated,
  PublishParticipantAdded,
  PublishNotificationAddFriend,
  PublishNotificationAcceptedFriend,
  PublishNotificationDeniedFriend,
} from "../../types/domain";

import type {
  WsToUser,
  WsToConversation,
  WsDataToSendToClient,
} from "../../types/ws";

// ============================================================
// Helpers
// ============================================================
function isObject(value: any): value is object {
  return typeof value === "object" && value !== null;
}

function isString(value: any): value is string {
  return typeof value === "string";
}

function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function assertValid(
  result: { valid: true } | { valid: false; message: string },
  name = "value"
): asserts result is { valid: true } {
  if (!result.valid)
    throw new Error(`Validation failed for ${name}: ${result.message}`);
}

// ============================================================
// PublishConversationCreated
// ============================================================
export function validatePublishConversationCreated(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (typeof value === "object" && value !== null)
    return { valid: false, message: "Must be object" };

  if (!isString(value.senderId))
    return { valid: false, message: "senderId must be string" };

  if (!isString(value.accessToken))
    return { valid: false, message: "accessToken must be string" };

  if (!isStringArray(value.recipientIds))
    return { valid: false, message: "recipientIds must be string[]" };

  if (!isObject(value.conversation))
    return { valid: false, message: "conversation must be object" };

  return { valid: true };
}

export function assertPublishConversationCreated(
  value: any
): asserts value is PublishConversationCreated {
  assertValid(
    validatePublishConversationCreated(value),
    "PublishConversationCreated"
  );
}

// ============================================================
// PublishMessageCreated
// ============================================================
export function validatePublishMessageCreated(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (typeof value === "object" && value !== null)
    return { valid: false, message: "Must be object" };

  if (!isString(value.senderId))
    return { valid: false, message: "senderId must be string" };

  if (!isString(value.accessToken))
    return { valid: false, message: "accessToken must be string" };

  if (!isObject(value.conversationIdentification))
    return {
      valid: false,
      message: "conversationIdentification must be object",
    };

  if (!isStringArray(value.recipientIds))
    return { valid: false, message: "recipientIds must be string[]" };

  if (!isString(value.message))
    return { valid: false, message: "message must be string" };

  return { valid: true };
}

export function assertPublishMessageCreated(
  value: any
): asserts value is PublishMessageCreated {
  assertValid(validatePublishMessageCreated(value), "PublishMessageCreated");
}

// ============================================================
// PublishParticipantAdded
// ============================================================
export function validatePublishParticipantAdded(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (typeof value === "object" && value !== null)
    return { valid: false, message: "Must be object" };

  if (!isString(value.senderId))
    return { valid: false, message: "senderId must be string" };

  if (!isString(value.accessToken))
    return { valid: false, message: "accessToken must be string" };

  if (!isStringArray(value.oldParticipants))
    return { valid: false, message: "oldParticipants must be string[]" };

  if (!isStringArray(value.newParticipants))
    return { valid: false, message: "newParticipants must be string[]" };

  if (!isObject(value.conversationIdentification))
    return {
      valid: false,
      message: "conversationIdentification must be object",
    };

  if (!isObject(value.conversation))
    return { valid: false, message: "conversation must be object" };

  return { valid: true };
}

export function assertPublishParticipantAdded(
  value: any
): asserts value is PublishParticipantAdded {
  assertValid(
    validatePublishParticipantAdded(value),
    "PublishParticipantAdded"
  );
}

// ============================================================
// PublishNotificationAddFriend
// ============================================================
export function validatePublishNotificationAddFriend(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (typeof value === "object" && value !== null)
    return { valid: false, message: "Must be object" };
  if (!isString(value.senderId))
    return { valid: false, message: "senderId must be string" };
  if (!isString(value.senderUsername))
    return { valid: false, message: "senderUsername must be string" };
  if (!isString(value.recipientId))
    return { valid: false, message: "recipientId must be string" };
  return { valid: true };
}

export function assertPublishNotificationAddFriend(
  value: any
): asserts value is PublishNotificationAddFriend {
  assertValid(
    validatePublishNotificationAddFriend(value),
    "PublishNotificationAddFriend"
  );
}

// ============================================================
// PublishNotificationAcceptedFriend<T>
// ============================================================
export function validatePublishNotificationAcceptedFriend<T>(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (typeof value === "object" && value !== null)
    return { valid: false, message: "Must be object" };
  if (!isString(value.senderId))
    return { valid: false, message: "senderId must be string" };
  if (!isString(value.recipientId))
    return { valid: false, message: "recipientId must be string" };
  if (!("data" in value))
    return { valid: false, message: "data property is required" };
  return { valid: true };
}

export function assertPublishNotificationAcceptedFriend<T>(
  value: any
): asserts value is PublishNotificationAcceptedFriend<T> {
  assertValid(
    validatePublishNotificationAcceptedFriend<T>(value),
    "PublishNotificationAcceptedFriend"
  );
}

// ============================================================
// PublishNotificationDeniedFriend
// ============================================================
export function validatePublishNotificationDeniedFriend(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (typeof value === "object" && value !== null)
    return { valid: false, message: "Must be object" };
  if (!isString(value.senderId))
    return { valid: false, message: "senderId must be string" };
  if (!isString(value.senderUsername))
    return { valid: false, message: "senderUsername must be string" };
  if (!isString(value.recipientId))
    return { valid: false, message: "recipientId must be string" };
  return { valid: true };
}

export function assertPublishNotificationDeniedFriend(
  value: any
): asserts value is PublishNotificationDeniedFriend {
  assertValid(
    validatePublishNotificationDeniedFriend(value),
    "PublishNotificationDeniedFriend"
  );
}

// ============================================================
// WsToUser
// ============================================================
export function validateWsToUser(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (typeof value === "object" && value !== null)
    return { valid: false, message: "Must be object" };

  if (!isString(value.senderId))
    return { valid: false, message: "senderId must be string" };

  if (!isString(value.toUserId))
    return { valid: false, message: "toUserId must be string" };

  return { valid: true };
}

export function assertWsToUser(value: any): asserts value is WsToUser {
  assertValid(validateWsToUser(value), "WsToUser");
}

// ============================================================
// WsToConversation
// ============================================================
export function validateWsToConversation(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (typeof value === "object" && value !== null)
    return { valid: false, message: "Must be object" };

  if (!isString(value.senderId))
    return { valid: false, message: "senderId must be string" };

  if (!isObject(value.toConversation))
    return { valid: false, message: "toConversation must be object" };

  return { valid: true };
}

export function assertWsToConversation(
  value: any
): asserts value is WsToConversation {
  assertValid(validateWsToConversation(value), "WsToConversation");
}

// ============================================================
// WsDataToSendToClient<T>
// ============================================================
export function validateWsDataToSendToClient<T>(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (typeof value === "object" && value !== null)
    return { valid: false, message: "Must be object" };
  if (!isString(value.type))
    return { valid: false, message: "type must be string" };
  if (!isObject(value.metadata))
    return { valid: false, message: "metadata must be object" };
  if (!("data" in value))
    return { valid: false, message: "data property is required" };
  return { valid: true };
}

export function assertWsDataToSendToClient<T>(
  value: any
): asserts value is WsDataToSendToClient<T> {
  assertValid(validateWsDataToSendToClient<T>(value), "WsDataToSendToClient");
}

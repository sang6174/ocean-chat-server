import type {
  RegisterDomainInput,
  LoginDomainInput,
  StringTokenPayload,
  UserTokenPayload,
  RefreshTokenPayload,
  CreateGroupConversationDomainInput,
  CreateConversationRepositoryOutput,
  SendMessageDomainInput,
  CreateMessageRepositoryOutput,
  AddParticipantsDomainInput,
  AddParticipantsRepositoryOutput,
  GetProfileUserDomainInput,
  GetProfileUserDomainOutput,
  GetConversationsByUserIdDomainInput,
  GetConversationsByUserIdDomainOutput,
  GetMessagesByConversationIdDomainInput,
  GetMessagesByConversationIdDomainOutput,
  LogoutDomainInput,
  FriendRequestDomainInput,
  FriendRequestWithNotificationIdDomainInput,
} from "../../types/domain";

import {
  isName,
  isUUIDv4,
  isEmail,
  isNumber,
  isPassword,
  isPlainObject,
  isUsername,
  isString,
  assertValid,
  isTypeConversationEnum,
} from "./helper";

// Register Domain Input
export function validateRegisterDomainInput(
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

export function assertRegisterDomainInput(
  value: any
): asserts value is RegisterDomainInput {
  assertValid(validateRegisterDomainInput(value), "RegisterDomainInput");
}

// Login Domain Input
export function validateLoginDomainInput(
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

export function assertLoginDomainInput(
  value: any
): asserts value is LoginDomainInput {
  assertValid(validateLoginDomainInput(value), "LoginDomainInput");
}

// Login Domain Output

// Logout domain input
export function validateLogoutDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isUUIDv4(value.userId)) {
    return { valid: false, message: "userId must be a uuidv4" };
  }

  if (!isString(value.accessToken)) {
    return { valid: false, message: "accessToken must be a string" };
  }

  if (!isString(value.refreshToken)) {
    return { valid: false, message: "refreshToken must be a string" };
  }

  return { valid: true };
}

export function assertLogoutDomainInput(
  value: any
): asserts value is LogoutDomainInput {
  assertValid(validateLogoutDomainInput(value), "LogoutDomainInput");
}

// Payload of Access & Refresh Token
export function isDecodedToken(value: unknown): value is StringTokenPayload {
  if (!isPlainObject(value)) return false;

  if (
    typeof value.data !== "string" ||
    typeof value.iat !== "number" ||
    typeof value.exp !== "number" ||
    !Number.isFinite(value.iat) ||
    !Number.isFinite(value.exp)
  ) {
    return false;
  }

  return true;
}

export function validateAccessToken(
  value: StringTokenPayload
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value)) {
    return {
      valid: false,
      message: "Must be an object",
    };
  }

  const v = value as any;

  if (!isNumber(v.iat)) {
    return {
      valid: false,
      message: "iat must be a number",
    };
  }

  if (!isNumber(v.exp)) {
    return {
      valid: false,
      message: "exp must be a number",
    };
  }

  if (!isPlainObject(v.data)) {
    return {
      valid: false,
      message: "data must be an object",
    };
  }

  if (!isUUIDv4(v.data.userId)) {
    return {
      valid: false,
      message: "data.userId must be a uuidv4",
    };
  }

  if (!isString(v.data.username)) {
    return {
      valid: false,
      message: "data.username must be a string",
    };
  }

  if (value.exp <= value.iat) {
    return {
      valid: false,
      message: "Access token expiration time must be greater than issued time.",
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (value.exp <= now) {
    return {
      valid: false,
      message: "Access token has expired.",
    };
  }

  return { valid: true };
}

export function assertUserTokenPayload(
  value: any
): asserts value is UserTokenPayload {
  assertValid(validateAccessToken(value), "validateAccessToken");
}

export function validateRefreshToken(
  value: StringTokenPayload
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value)) {
    return {
      valid: false,
      message: "Must be an object",
    };
  }

  const v = value as any;

  if (!isNumber(v.iat)) {
    return {
      valid: false,
      message: "iat must be a number",
    };
  }

  if (!isNumber(v.exp)) {
    return {
      valid: false,
      message: "exp must be a number",
    };
  }

  if (!isPlainObject(v.data)) {
    return {
      valid: false,
      message: "data must be an object",
    };
  }

  if (!isUUIDv4(v.data.userId)) {
    return {
      valid: false,
      message: "data.userId must be a string",
    };
  }

  if (!isString(v.data.accessToken)) {
    return {
      valid: false,
      message: "data.accessToken must be a string",
    };
  }

  if (value.exp <= value.iat) {
    return {
      valid: false,
      message:
        "Refresh token expiration time must be greater than issued time.",
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (value.exp <= now) {
    return {
      valid: false,
      message: "Refresh token has expired.",
    };
  }

  return { valid: true };
}

export function assertRefreshTokenPayload(
  value: any
): asserts value is RefreshTokenPayload {
  assertValid(validateRefreshToken(value), "validateRefreshToken");
}

// Get profile domain input
export function validateGetProfileUserDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isString(value.userId))
    return { valid: false, message: "userId must be string" };

  return { valid: true };
}

export function assertGetProfileUserDomainInput(
  value: any
): asserts value is GetProfileUserDomainInput {
  assertValid(
    validateGetProfileUserDomainInput(value),
    "GetProfileUserDomainInput"
  );
}

// Get profile domain output
export function validateGetProfileUserDomainOutput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value)) return { valid: false, message: "Must be object" };

  if (!isUUIDv4(value.id))
    return { valid: false, message: "id must be string" };

  if (!isName(value.name))
    return { valid: false, message: "name must be valid name" };

  if (!isEmail(value.email))
    return { valid: false, message: "email must be valid email" };

  if (!isUsername(value.username))
    return { valid: false, message: "username must be valid username" };

  return { valid: true };
}

export function assertGetProfileUserDomainOutput(
  value: any
): asserts value is GetProfileUserDomainOutput {
  assertValid(
    validateGetProfileUserDomainOutput(value),
    "GetProfileUserDomainOutput"
  );
}

// Create Myself Conversation Domain Input
export function validateCreateMyselfConversationDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isPlainObject(value.creator))
    return { valid: false, message: "creator must be an object" };

  if (!isUUIDv4(value.creator.id))
    return { valid: false, message: "creator.id must be uuidv4" };

  if (!isUsername(value.creator.username))
    return { valid: false, message: "creator.username must be string" };

  if (value.participantIds.length !== 1) {
    return { valid: false, message: "participantIds must have length be one" };
  }

  if (!isUUIDv4(value.participantIds[0]))
    return { valid: false, message: "participantIds must be uuidv4[]" };

  if (value.participantIds.includes(value.creator.id)) {
    return {
      valid: false,
      message: "participantIds must not include creator.id",
    };
  }

  if (!isTypeConversationEnum(value.type))
    return { valid: false, message: "type must be ConversationType" };

  return { valid: true };
}

export function assertCreateMyselfConversationDomainInput(
  value: any
): asserts value is CreateGroupConversationDomainInput {
  assertValid(
    validateCreateMyselfConversationDomainInput(value),
    "CreateMyselfConversationDomainInput"
  );
}

// Create Direct Conversation Domain Input
export function validateCreateDirectConversationDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!Array.isArray(value.participantIds))
    return { valid: false, message: "participantIds must be array" };

  for (const i of value.participantIds) {
    if (!isUUIDv4(i))
      return { valid: false, message: "participantIds[i] must be uuidv4" };
  }

  if (value.participantIds.length !== 2) {
    return { valid: false, message: "participantIds must have length be two" };
  }

  if (value.participantIds[0] === value.participantIds[1]) {
    return {
      valid: false,
      message: "participantIds must be different",
    };
  }

  if (!isString(value.type))
    return { valid: false, message: "type must be string" };

  return { valid: true };
}

export function assertCreateDirectConversationDomainInput(
  value: any
): asserts value is CreateGroupConversationDomainInput {
  assertValid(
    validateCreateDirectConversationDomainInput(value),
    "CreateDirectConversationDomainInput"
  );
}

// Create group conversation domain input
export function validateCreateGroupConversationDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isString(value.type))
    return { valid: false, message: "type must be string" };

  if (!isString(value.name))
    return { valid: false, message: "name must be string" };

  if (!isPlainObject(value.creator))
    return { valid: false, message: "creator must be an object" };

  if (!isUUIDv4(value.creator.id))
    return { valid: false, message: "creator.id must be uuidv4" };

  if (!isString(value.creator.username))
    return { valid: false, message: "creator.username must be string" };

  if (!Array.isArray(value.participantIds))
    return { valid: false, message: "participantIds must be array" };

  for (const p of value.participantIds) {
    if (!isUUIDv4(p))
      return { valid: false, message: "participantIds[i].id must be uuidv4" };
  }

  if (value.participantIds.length < 3) {
    return {
      valid: false,
      message: "participantIds's length must more than or equal three",
    };
  }

  if (value.participantIds.includes(value.creator.id)) {
    return {
      valid: false,
      message: "participantIds must not include creator.id",
    };
  }

  const participantIds = new Set(value.participantIds);
  if (value.participantIds.length !== participantIds.size) {
    return {
      valid: false,
      message: "participantIds must be different",
    };
  }

  return { valid: true };
}

export function assertCreateGroupConversationDomainInput(
  value: any
): asserts value is CreateGroupConversationDomainInput {
  assertValid(
    validateCreateGroupConversationDomainInput(value),
    "CreateGroupConversationDomainInput"
  );
}

// Create conversation repository output
export function validateCreateConversationRepositoryOutput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  // conversation
  if (!isPlainObject(value.conversation))
    return { valid: false, message: "conversation must be an object" };

  const conv = value.conversation;

  if (!isUUIDv4(conv.id))
    return { valid: false, message: "conversation.id must be uuidv4" };

  if (!isTypeConversationEnum(conv.type))
    return {
      valid: false,
      message: "conversation.type must be ConversationType",
    };

  if (typeof conv.name !== "string")
    return { valid: false, message: "conversation.name must be string" };

  if (!(conv.lastEvent instanceof Date))
    return { valid: false, message: "conversation.lastEvent must be Date" };

  if (!isPlainObject(conv.creator))
    return { valid: false, message: "conversation.creator must be an object" };

  if (!isUUIDv4(conv.creator.id))
    return { valid: false, message: "conversation.creator.id must be uuidv4" };

  if (!isUsername(conv.creator.username))
    return {
      valid: false,
      message: "conversation.creator.username must be string",
    };

  // participant
  if (!Array.isArray(value.participants))
    return { valid: false, message: "participants must be an array" };

  for (const p of value.participants) {
    if (!isPlainObject(p))
      return { valid: false, message: "participant must be an object" };

    if (!isPlainObject(p.user))
      return { valid: false, message: "participant.user must be an object" };

    if (!isUUIDv4(p.user.id))
      return { valid: false, message: "participant.user.id must be uuidv4" };

    if (!isUsername(p.user.username))
      return {
        valid: false,
        message: "participant.user.username must be string",
      };

    if (typeof p.role !== "string")
      return { valid: false, message: "participant.role must be string" };

    if (!(p.lastSeen instanceof Date))
      return { valid: false, message: "participant.lastSeen must be Date" };

    if (!(p.joinedAt instanceof Date))
      return { valid: false, message: "participant.joinedAt must be Date" };
  }

  // message
  if (!Array.isArray(value.messages))
    return { valid: false, message: "messages must be an array" };

  for (const m of value.messages) {
    if (!isPlainObject(m))
      return { valid: false, message: "message must be an object" };

    if (!isUUIDv4(m.id))
      return { valid: false, message: "message.id must be uuidv4" };

    if (typeof m.content !== "string")
      return { valid: false, message: "message.content must be string" };

    if (m.senderId !== null && !isUUIDv4(m.senderId))
      return {
        valid: false,
        message: "message.senderId must be uuidv4 or null",
      };
  }

  return { valid: true };
}

export function assertCreateConversationRepositoryOutput(
  value: any
): asserts value is CreateConversationRepositoryOutput {
  assertValid(
    validateCreateConversationRepositoryOutput(value),
    "CreateConversationRepositoryOutput"
  );
}

// Send message domain input
export function validateSendMessageDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isPlainObject(value.sender))
    return { valid: false, message: "sender must be an object" };

  if (!isUUIDv4(value.sender.id))
    return { valid: false, message: "sender.id must be uuidv4" };

  if (!isString(value.sender.username))
    return { valid: false, message: "sender.username must be string" };

  if (!isString(value.conversationId))
    return { valid: false, message: "conversationId must be string" };

  if (!isString(value.message))
    return { valid: false, message: "message must be string" };

  return { valid: true };
}

export function assertSendMessageDomainInput(
  value: any
): asserts value is SendMessageDomainInput {
  assertValid(validateSendMessageDomainInput(value), "SendMessageDomainInput");
}

// Create message repository output
export function validateCreateMessageRepositoryOutput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  // message
  if (!isPlainObject(value.message))
    return { valid: false, message: "message must be an object" };

  const m = value.message;

  if (!isUUIDv4(m.id))
    return { valid: false, message: "message.id must be uuidv4" };

  if (typeof m.content !== "string")
    return { valid: false, message: "message.content must be string" };

  if (m.senderId !== null && !isUUIDv4(m.senderId))
    return { valid: false, message: "message.senderId must be uuidv4 or null" };

  if (!isUUIDv4(m.conversationId))
    return { valid: false, message: "message.conversationId must be uuidv4" };

  // participants
  if (!Array.isArray(value.participants))
    return { valid: false, message: "participants must be an array" };

  for (const p of value.participants) {
    if (!isPlainObject(p))
      return { valid: false, message: "participant must be an object" };

    if (!isPlainObject(p.user))
      return { valid: false, message: "participant.user must be an object" };

    if (!isUUIDv4(p.user.id))
      return { valid: false, message: "participant.user.id must be uuidv4" };

    if (!isUsername(p.user.username))
      return {
        valid: false,
        message: "participant.user.username must be string",
      };

    if (typeof p.role !== "string")
      return { valid: false, message: "participant.role must be string" };

    if (!(p.lastSeen instanceof Date))
      return { valid: false, message: "participant.lastSeen must be Date" };

    if (!(p.joinedAt instanceof Date))
      return { valid: false, message: "participant.joinedAt must be Date" };
  }

  return { valid: true };
}

export function assertCreateMessageRepositoryOutput(
  value: any
): asserts value is CreateMessageRepositoryOutput {
  assertValid(
    validateCreateMessageRepositoryOutput(value),
    "CreateMessageRepositoryOutput"
  );
}

// Add participant domain input
export function validateAddParticipantsDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isUUIDv4(value.creator.id))
    return { valid: false, message: "creator.id must be uuidv4" };

  if (!isString(value.creator.username))
    return { valid: false, message: "creator.username must be string" };

  if (!isUUIDv4(value.conversationId))
    return { valid: false, message: "conversationId must be uuidv4" };

  if (!Array.isArray(value.participantIds))
    return { valid: false, message: "participantIds must be array" };

  for (const i of value.participantIds) {
    if (!isUUIDv4(i)) {
      return { valid: false, message: "participantIds[i] must be uuidv4" };
    }
  }

  const participantIds = new Set(value.participantIds);
  if (value.participantIds.length !== participantIds.size) {
    return {
      valid: false,
      message: "participantIds must be different",
    };
  }

  return { valid: true };
}

export function assertAddParticipantsDomainInput(
  value: any
): asserts value is AddParticipantsDomainInput {
  assertValid(
    validateAddParticipantsDomainInput(value),
    "AddParticipantsDomainInput"
  );
}

// Add participant repository output
export function validateAddParticipantsRepositoryOutput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  // participants
  if (!Array.isArray(value.participants))
    return { valid: false, message: "participants must be an array" };

  for (const p of value.participants) {
    if (!isPlainObject(p))
      return { valid: false, message: "participant must be an object" };

    if (!isPlainObject(p.user))
      return { valid: false, message: "participant.user must be an object" };

    if (!isUUIDv4(p.user.id))
      return { valid: false, message: "participant.user.id must be uuidv4" };

    if (!isUsername(p.user.username))
      return {
        valid: false,
        message: "participant.user.username must be string",
      };

    if (typeof p.role !== "string")
      return { valid: false, message: "participant.role must be string" };

    if (!(p.lastSeen instanceof Date))
      return { valid: false, message: "participant.lastSeen must be Date" };

    if (!(p.joinedAt instanceof Date))
      return { valid: false, message: "participant.joinedAt must be Date" };
  }

  // messages
  if (!Array.isArray(value.messages))
    return { valid: false, message: "messages must be an array" };

  for (const m of value.messages) {
    if (!isPlainObject(m))
      return { valid: false, message: "message must be an object" };

    if (!isUUIDv4(m.id))
      return { valid: false, message: "message.id must be uuidv4" };

    if (typeof m.content !== "string")
      return { valid: false, message: "message.content must be string" };

    if (m.senderId !== null && !isUUIDv4(m.senderId))
      return {
        valid: false,
        message: "message.senderId must be uuidv4 or null",
      };

    if (!isUUIDv4(m.conversationId))
      return { valid: false, message: "message.conversationId must be uuidv4" };
  }

  return { valid: true };
}

export function assertAddParticipantsRepositoryOutput(
  value: any
): asserts value is AddParticipantsRepositoryOutput {
  assertValid(
    validateAddParticipantsRepositoryOutput(value),
    "AddParticipantsRepositoryOutput"
  );
}

// Get conversations by user id domain input
export function validateGetConversationsByUserIdDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isString(value.userId))
    return { valid: false, message: "userId must be string" };
  return { valid: true };
}

export function assertGetConversationDomainInput(
  value: any
): asserts value is GetConversationsByUserIdDomainInput {
  assertValid(
    validateGetConversationsByUserIdDomainInput(value),
    "GetConversationDomainInput"
  );
}

// Get conversations by user id domain output
export function validateGetConversationsByUserIdDomainOutput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value)) return { valid: false, message: "Must be object" };

  if (!isString(value.conversationId))
    return { valid: false, message: "conversation must be string" };

  if (!Array.isArray(value.participants))
    return { valid: false, message: "participants must be array" };

  for (const p of value.participants) {
    if (!isUUIDv4(p.id))
      return { valid: false, message: "participant.id must be uuidv4" };

    if (!isUsername(p.username))
      return {
        valid: false,
        message: "participant.username must be valid username",
      };
  }

  if (!Array.isArray(value.messages))
    return { valid: false, message: "messages must be string[]" };

  for (const m of value.messages) {
    if (!isString(m.id))
      return { valid: false, message: "message.id must be string" };

    if (!isString(m.message))
      return { valid: false, message: "message.message must be string" };
  }

  return { valid: true };
}

export function assertGetConversationsByUerIdDomainOutput(
  value: any
): asserts value is GetConversationsByUserIdDomainOutput {
  assertValid(
    validateGetConversationsByUserIdDomainOutput(value),
    "GetConversationDomainOutput"
  );
}

// Get messages by conversation id domain input
export function validateGetMessagesByConversationIdDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isString(value.conversationId))
    return { valid: false, message: "conversationId must be string" };

  if (value.limit !== undefined && typeof value.limit !== "number")
    return { valid: false, message: "limit must be number" };

  if (value.offset !== undefined && typeof value.offset !== "number")
    return { valid: false, message: "offset must be number" };
  return { valid: true };
}

export function assertGetMessagesByConversationIdDomainInput(
  value: any
): asserts value is GetMessagesByConversationIdDomainInput {
  assertValid(
    validateGetMessagesByConversationIdDomainInput(value),
    "GetMessagesDomainInput"
  );
}

// Friend request domain input
export function validateFriendRequestDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isPlainObject(value.sender))
    return { valid: false, message: "sender must be an object" };

  if (!isUUIDv4(value.sender.id))
    return { valid: false, message: "sender.id must be uuidv4" };

  if (!isString(value.sender.username))
    return { valid: false, message: "sender.username must be string" };

  if (!isPlainObject(value.recipient))
    return { valid: false, message: "recipient must be an object" };

  if (!isUUIDv4(value.recipient.id))
    return { valid: false, message: "recipient.id must be uuidv4" };

  if (!isString(value.recipient.username))
    return { valid: false, message: "recipient.username must be string" };

  return { valid: true };
}

export function assertFriendRequestDomainInput(
  value: any
): asserts value is FriendRequestDomainInput {
  assertValid(
    validateFriendRequestDomainInput(value),
    "FriendRequestDomainInput"
  );
}

// Friend request with notification id domain input
export function validateFriendRequestWithNotificationIdDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isUUIDv4(value.notificationId))
    return { valid: false, message: "notificationId must be uuidv4" };

  if (!isPlainObject(value.sender))
    return { valid: false, message: "sender must be an object" };

  if (!isUUIDv4(value.sender.id))
    return { valid: false, message: "sender.id must be uuidv4" };

  if (!isUsername(value.sender.username))
    return { valid: false, message: "sender.username must be string" };

  if (!isPlainObject(value.recipient))
    return { valid: false, message: "recipient must be an object" };

  if (!isUUIDv4(value.recipient.id))
    return { valid: false, message: "recipient.id must be uuidv4" };

  if (!isUsername(value.recipient.username))
    return { valid: false, message: "recipient.username must be string" };

  if (value.sender.id === value.recipient.id)
    return { valid: false, message: "sender and recipient must be different" };

  return { valid: true };
}

export function assertFriendRequestWithNotificationIdDomainInput(
  value: any
): asserts value is FriendRequestWithNotificationIdDomainInput {
  assertValid(
    validateFriendRequestWithNotificationIdDomainInput(value),
    "FriendRequestWithNotificationIdDomainInput"
  );
}

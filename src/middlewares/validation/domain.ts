import type {
  RegisterDomainInput,
  LoginDomainInput,
  StringTokenPayload,
  UserTokenPayload,
  RefreshTokenPayload,
  CreateConversationDomainInput,
  SendMessageDomainInput,
  AddParticipantsDomainInput,
  GetProfileUserDomainInput,
  GetProfileUserDomainOutput,
  GetConversationDomainInput,
  GetConversationDomainOutput,
  GetMessagesDomainInput,
  GetMessagesDomainOutput,
  LogoutDomainInput,
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
  isStringArray,
  assertValid,
  isTypeConversationEnum,
  validateConversationMetadata,
} from "./helper";
import { AuthError } from "../../helpers/errors";

// ============================================================
// Register
// ============================================================
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

// ============================================================
// Login
// ============================================================
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

// ============================================================
// Logout
// ============================================================
export function validateLogoutDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isUUIDv4(value.userId)) {
    return { valid: false, message: "userId must be a uuidv4" };
  }

  if (!isString(value.authToken)) {
    return { valid: false, message: "authToken must be a uuidv4" };
  }

  return { valid: true };
}

export function assertLogoutDomainInput(
  value: any
): asserts value is LogoutDomainInput {
  assertValid(validateLogoutDomainInput(value), "LogoutDomainInput");
}

// ============================================================
// Auth Token
// ============================================================
export function isDecodedAuthToken(
  value: unknown
): value is StringTokenPayload {
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

  let dataObj: any;
  try {
    dataObj = JSON.parse(value.data);
  } catch {
    return false;
  }

  return (
    isPlainObject(dataObj) &&
    isUUIDv4(dataObj.userId) &&
    isString(dataObj.username)
  );
}

export function validateAuthToken(
  payload: StringTokenPayload
): { valid: true } | { valid: false; message: string } {
  if (payload.exp <= payload.iat) {
    return {
      valid: false,
      message: "Auth token expiration time must be greater than issued time.",
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    return {
      valid: false,
      message: "Auth token has expired.",
    };
  }

  return { valid: true };
}

export function assertUserTokenPayload(
  value: unknown
): asserts value is UserTokenPayload {
  if (!isPlainObject(value)) {
    throw new AuthError("UserTokenPayload must be an object");
  }

  const v = value as any;

  if (!isNumber(v.iat)) {
    throw new AuthError("UserTokenPayload.iat must be a number");
  }

  if (!isNumber(v.exp)) {
    throw new AuthError("UserTokenPayload.exp must be a number");
  }

  if (!isPlainObject(v.data)) {
    throw new AuthError("UserTokenPayload.data must be an object");
  }

  if (!isUUIDv4(v.data.userId)) {
    throw new AuthError("UserTokenPayload.data.userId must be a string");
  }

  if (!isString(v.data.username)) {
    throw new AuthError("UserTokenPayload.data.username must be a string");
  }
}

// ============================================================
// Refresh Token
// ============================================================
export function isDecodedRefreshToken(
  value: unknown
): value is StringTokenPayload {
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

  let dataObj: any;
  try {
    dataObj = JSON.parse(value.data);
  } catch {
    return false;
  }

  return (
    isPlainObject(dataObj) &&
    isUUIDv4(dataObj.userId) &&
    isString(dataObj.authToken)
  );
}

export function validateRefreshToken(
  payload: StringTokenPayload
): { valid: true } | { valid: false; message: string } {
  if (payload.exp <= payload.iat) {
    return {
      valid: false,
      message:
        "Refresh token expiration time must be greater than issued time.",
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    return {
      valid: false,
      message: "Refresh token has expired.",
    };
  }

  return { valid: true };
}

export function assertRefreshTokenPayload(
  value: unknown
): asserts value is RefreshTokenPayload {
  if (!isPlainObject(value)) {
    throw new AuthError("RefreshTokenPayload must be an object");
  }

  const v = value as any;

  if (!isNumber(v.iat)) {
    throw new AuthError("RefreshTokenPayload.iat must be a number");
  }

  if (!isNumber(v.exp)) {
    throw new AuthError("RefreshTokenPayload.exp must be a number");
  }

  if (!isPlainObject(v.data)) {
    throw new AuthError("RefreshTokenPayload.data must be an object");
  }

  if (!isUUIDv4(v.data.userId)) {
    throw new AuthError("RefreshTokenPayload.data.userId must be a string");
  }

  if (!isString(v.data.authToken)) {
    throw new AuthError(
      "RefreshTokenPayload.data.accessToken must be a string"
    );
  }
}

// ============================================================
// Create Myself Conversation
// ============================================================
export function validateCreateMyselfConversationDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isPlainObject(value.creator))
    return { valid: false, message: "creator must be an object" };

  if (!isUUIDv4(value.creator.id))
    return { valid: false, message: "creator.id must be uuidv4" };

  if (!isString(value.creator.username))
    return { valid: false, message: "creator.username must be string" };

  if (!isUUIDv4(value.participantIds[0]))
    return { valid: false, message: "participantIds must be uuidv4[]" };

  if (!value.authToken)
    return { valid: false, message: "authToken must be string" };

  if (!isTypeConversationEnum(value.type))
    return { valid: false, message: "type must be string" };

  return validateConversationMetadata(value.metadata);
}

export function assertCreateMyselfConversationDomainInput(
  value: any
): asserts value is CreateConversationDomainInput {
  assertValid(
    validateCreateMyselfConversationDomainInput(value),
    "CreateMyselfConversationDomainInput"
  );
}

// ============================================================
// Create Direct Conversation
// ============================================================
export function validateCreateDirectConversationDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isPlainObject(value.creator))
    return { valid: false, message: "sender must be an object" };

  if (!isUUIDv4(value.sender.id))
    return { valid: false, message: "sender.id must be uuidv4" };

  if (!isString(value.sender.username))
    return { valid: false, message: "sender.username must be string" };

  if (!isStringArray(value.participantIds))
    return { valid: false, message: "participantIds must be uuidv4[]" };

  for (const i of value.participantIds) {
    if (!isUUIDv4(i))
      return { valid: false, message: "participantIds must be uuidv4[]" };
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

  if (!isString(value.authToken))
    return { valid: false, message: "authToken must be string" };

  if (!isString(value.type))
    return { valid: false, message: "type must be string" };

  return validateConversationMetadata(value.metadata);
}

export function assertCreateDirectConversationDomainInput(
  value: any
): asserts value is CreateConversationDomainInput {
  assertValid(
    validateCreateDirectConversationDomainInput(value),
    "CreateDirectConversationDomainInput"
  );
}

// ============================================================
// Create Group Conversation
// ============================================================
export function validateCreateGroupConversationDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isString(value.type))
    return { valid: false, message: "type must be string" };

  if (!isString(value.authToken))
    return { valid: false, message: "authToken must be string" };

  if (!Array.isArray(value.participants))
    return { valid: false, message: "participants must be array" };

  for (const p of value.participants) {
    if (!isUUIDv4(p.id))
      return { valid: false, message: "participants[i].id must be uuidv4" };
    if (!isString(p.username))
      return {
        valid: false,
        message: "participants[i].username must be string",
      };
  }

  if (value.participants.length < 3) {
    return {
      valid: false,
      message: "participants's length must more than or equal three",
    };
  }

  const participants = new Set(value.participants);
  if (value.participants.length !== participants.size) {
    return {
      valid: false,
      message: "participants must be different",
    };
  }

  return validateConversationMetadata(value.metadata);
}

export function assertCreateGroupConversationDomainInput(
  value: any
): asserts value is CreateConversationDomainInput {
  assertValid(
    validateCreateGroupConversationDomainInput(value),
    "CreateGroupConversationDomainInput"
  );
}

// ============================================================
// Send Message
// ============================================================
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

  if (!isString(value.authToken))
    return { valid: false, message: "authToken must be string" };

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

// ============================================================
// Add Participants
// ============================================================
export function validateAddParticipantsDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be an object" };

  if (!isPlainObject(value.creator))
    return { valid: false, message: "sender must be an object" };

  if (!isUUIDv4(value.creator.id))
    return { valid: false, message: "creator.id must be uuidv4" };

  if (!isString(value.creator.username))
    return { valid: false, message: "creator.username must be string" };

  if (!isString(value.authToken))
    return { valid: false, message: "accessToken must be string" };

  if (!isString(value.conversationId))
    return { valid: false, message: "conversation must be string" };

  if (!Array.isArray(value.participants))
    return { valid: false, message: "participants must be string" };

  for (const i of value.participants) {
    if (!isUUIDv4(i.id)) {
      return { valid: false, message: "participants[i].id must be uuidv4[]" };
    }

    if (!isString(i.username)) {
      return {
        valid: false,
        message: "participants[i].username must be string",
      };
    }
  }

  const participants = new Set(value.participants);
  if (value.participants.length !== participants.size) {
    return {
      valid: false,
      message: "participants must be different",
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

// ============================================================
// Get Profile User
// ============================================================
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

// ============================================================
// Get Conversation
// ============================================================
export function validateGetConversationDomainInput(
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
): asserts value is GetConversationDomainInput {
  assertValid(
    validateGetConversationDomainInput(value),
    "GetConversationDomainInput"
  );
}

// ============================================================
// Get Messages
// ============================================================
export function validateGetMessagesDomainInput(
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

export function assertGetMessagesDomainInput(
  value: any
): asserts value is GetMessagesDomainInput {
  assertValid(validateGetMessagesDomainInput(value), "GetMessagesDomainInput");
}

// ============================================================
// GetProfileUserDomainOutput
// ============================================================
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

// ============================================================
// GetConversationDomainOutput
// ============================================================
export function validateGetConversationDomainOutput(
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

export function assertGetConversationDomainOutput(
  value: any
): asserts value is GetConversationDomainOutput {
  assertValid(
    validateGetConversationDomainOutput(value),
    "GetConversationDomainOutput"
  );
}

// ============================================================
// GetMessagesDomainOutput
// ============================================================
export function validateGetMessagesDomainOutput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value)) return { valid: false, message: "Must be object" };

  if (!isString(value.id))
    return { valid: false, message: "id must be string" };

  if (!isPlainObject(value.sender))
    return { valid: false, message: "sender must be object" };

  if (!isString(value.conversationId))
    return { valid: false, message: "conversationId must be string" };

  if (!isString(value.message))
    return { valid: false, message: "message must be string" };

  return { valid: true };
}

export function assertGetMessagesDomainOutput(
  value: any
): asserts value is GetMessagesDomainOutput {
  assertValid(
    validateGetMessagesDomainOutput(value),
    "GetMessagesDomainOutput"
  );
}

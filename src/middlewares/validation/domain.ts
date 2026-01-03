import type {
  StringTokenPayload,
  UserTokenPayload,
  RefreshTokenPayload,
  GenerateAccessTokenOutput,
  CreateGroupConversationDomainInput,
  AddParticipantsDomainInput,
  GetProfileUserDomainInput,
  GetProfileUserDomainOutput,
  GetConversationsByUserIdDomainInput,
  LogoutDomainInput,
} from "../../types/domain";

import {
  isName,
  isUUIDv4,
  isEmail,
  isNumber,
  isPlainObject,
  isUsername,
  isString,
  assertValidInput,
  assertValidOutput,
} from "./helper";

// ============================================================
// Validate domain input
// ============================================================
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
  assertValidInput(validateLogoutDomainInput(value), "LogoutDomainInput");
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
  assertValidInput(validateAccessToken(value), "UserTokenPayload");
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
  assertValidInput(validateRefreshToken(value), "RefreshTokenPayload");
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
  assertValidInput(
    validateGetProfileUserDomainInput(value),
    "GetProfileUserDomainInput"
  );
}

// Create group conversation domain input
export function validateCreateGroupConversationDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!value.participantIds.includes(value.creator.id))
    return {
      valid: false,
      message: "participantIds must contain creator.id",
    };

  if (value.participantIds.length < 3)
    return {
      valid: false,
      message: "participantIds's length must more than or equal three",
    };

  const participantIds = new Set(value.participantIds);
  if (value.participantIds.length !== participantIds.size)
    return {
      valid: false,
      message: "participantIds must be different",
    };

  return { valid: true };
}

export function assertCreateGroupConversationDomainInput(
  value: any
): asserts value is CreateGroupConversationDomainInput {
  assertValidInput(
    validateCreateGroupConversationDomainInput(value),
    "CreateGroupConversationDomainInput"
  );
}

// Add participant domain input
export function validateAddParticipantsDomainInput(
  value: any
): { valid: true } | { valid: false; message: string } {
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
  assertValidInput(
    validateAddParticipantsDomainInput(value),
    "AddParticipantsDomainInput"
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

export function assertGetConversationsByUseridDomainInput(
  value: any
): asserts value is GetConversationsByUserIdDomainInput {
  assertValidInput(
    validateGetConversationsByUserIdDomainInput(value),
    "GetConversationsByUserIdDomainInput"
  );
}

// ============================================================
// Validate domain output
// ============================================================
// Generate access token output
export function validateGenerateAccessTokenOutput(
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

export function assertGenerateAccessTokenOutput(
  value: any
): asserts value is GenerateAccessTokenOutput {
  assertValidOutput(
    validateGenerateAccessTokenOutput(value),
    "GenerateAccessTokenOutput"
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
  assertValidInput(
    validateGetProfileUserDomainOutput(value),
    "GetProfileUserDomainOutput"
  );
}

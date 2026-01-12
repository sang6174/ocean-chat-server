import type {
  StringTokenPayload,
  UserTokenPayload,
  RefreshTokenPayload,
  GenerateAuthTokenDomainInput,
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
    return { valid: false, message: "Invalid user ID." };
  }

  if (!isString(value.refreshToken)) {
    return { valid: false, message: "Invalid refresh token." };
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
      message: "Invalid token data.",
    };
  }

  if (!isNumber(v.exp)) {
    return {
      valid: false,
      message: "Invalid token data.",
    };
  }

  if (!isPlainObject(v.data)) {
    return {
      valid: false,
      message: "Invalid token data.",
    };
  }

  if (!isUUIDv4(v.data.userId)) {
    return {
      valid: false,
      message: "Invalid token data.",
    };
  }

  if (!isString(v.data.username)) {
    return {
      valid: false,
      message: "Invalid token data.",
    };
  }

  if (value.exp <= value.iat) {
    return {
      valid: false,
      message: "Invalid token configuration.",
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (value.exp <= now) {
    return {
      valid: false,
      message: "Session expired.",
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
      message: "Invalid token data.",
    };
  }

  if (!isNumber(v.exp)) {
    return {
      valid: false,
      message: "Invalid token data.",
    };
  }

  if (!isPlainObject(v.data)) {
    return {
      valid: false,
      message: "Invalid token data.",
    };
  }

  if (!isUUIDv4(v.data.userId)) {
    return {
      valid: false,
      message: "Invalid token data.",
    };
  }

  if (!isUUIDv4(v.data.jti)) {
    return {
      valid: false,
      message: "Invalid token data.",
    };
  }

  if (value.exp <= value.iat) {
    return {
      valid: false,
      message: "Invalid token configuration.",
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (value.exp <= now) {
    return {
      valid: false,
      message: "Session expired.",
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
      message: "You must be a participant in the group you create.",
    };

  if (value.participantIds.length < 3)
    return {
      valid: false,
      message: "Group must have at least 3 participants.",
    };

  const participantIds = new Set(value.participantIds);
  if (value.participantIds.length !== participantIds.size)
    return {
      valid: false,
      message: "Duplicate participants found.",
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
      message: "Duplicate participants found.",
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
// Generate auth token output
export function validateGenerateAuthTokenOutput(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value))
    return { valid: false, message: "Must be a object" };

  if (!isUUIDv4(value.userId))
    return { valid: false, message: "Invalid user ID." };

  if (!isUsername(value.username))
    return { valid: false, message: "Invalid username." };

  if (!isString(value.accessToken))
    return { valid: false, message: "Invalid access token." };

  if (!isString(value.refreshToken))
    return { valid: false, message: "Invalid refresh token." };

  return { valid: true };
}

export function assertGenerateAuthTokenOutput(
  value: any
): asserts value is GenerateAuthTokenDomainInput {
  assertValidOutput(
    validateGenerateAuthTokenOutput(value),
    "GenerateAuthTokenOutput"
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

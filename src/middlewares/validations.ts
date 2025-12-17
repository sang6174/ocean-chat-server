import type { HttpRegisterPost, HttpLoginPost } from "../types/http";
import { ConversationType } from "../types/domain";
import type { PgError } from "../types/models";
import type {
  ConversationIdentifier,
  StringTokenPayload,
} from "../types/domain";

// ============================================================
// Pure function
// ============================================================
export function isPlainObject(value: any): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isUUIDv4(value: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value);
}

export function isName(
  value: any,
  minLength = 8,
  maxLength = 50
): value is string {
  if (typeof value !== "string") return false;

  const name = value.trim();
  if (name.length < minLength || name.length > maxLength) return false;

  return /[A-Za-zÀ-ỹ]/.test(name);
}

export function isUsername(
  value: any,
  minLength: number = 8,
  maxLength: number = 32
) {
  return (
    typeof value === "string" &&
    value.trim().length >= minLength &&
    value.trim().length <= maxLength
  );
}

export function isEmail(email: any): email is string {
  if (typeof email !== "string") return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isPassword(
  value: any,
  minLength: number = 8,
  maxLength: number = 32
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length >= minLength &&
    value.trim().length <= maxLength
  );
}

function isTypeConversationEnum(value: any): value is ConversationType {
  return Object.values(ConversationType).includes(value);
}
// ============================================================
// Validate request body or search params
// ============================================================
export function validateRegisterInput(data: HttpRegisterPost): {
  valid: boolean;
  message?: string;
} {
  if (!data) {
    return {
      valid: false,
      message: "The server did not receive the request body.",
    };
  }

  if (!data.name) {
    return {
      valid: false,
      message: "The name field is required.",
    };
  }

  if (!data.username) {
    return {
      valid: false,
      message: "The username field is required.",
    };
  }

  if (!data.email) {
    return {
      valid: false,
      message: "The email field is required.",
    };
  }

  if (!data.password) {
    return {
      valid: false,
      message: "The password field is required.",
    };
  }

  if (!isName(data.name)) {
    return {
      valid: false,
      message:
        "Name must be a non-empty string between 2 and 50 characters and contain only letters and spaces.",
    };
  }

  if (!isUsername(data.username)) {
    return {
      valid: false,
      message:
        "Username must be a non-empty string with 8 to 32 characters, excluding leading and trailing spaces.",
    };
  }

  if (!isEmail(data.email)) {
    return {
      valid: false,
      message:
        "Email must be a valid email address in the format name@example.com.",
    };
  }

  if (!isPassword(data.password)) {
    return {
      valid: false,
      message: "Password must be a string with 8 to 32 characters.",
    };
  }

  return { valid: true };
}

export function validateLoginInput(
  data: HttpLoginPost
): { valid: true } | { valid: false; message: string } {
  if (!isUsername(data.username)) {
    return {
      valid: false,
      message: "Invalid username format.",
    };
  }

  if (!isPassword(data.password)) {
    return {
      valid: false,
      message: "Invalid password format.",
    };
  }

  return { valid: true };
}

export function isDecodedAuthToken(value: any): value is StringTokenPayload {
  if (!isPlainObject(value)) return false;

  const { data, iat, exp } = value;
  if (typeof data !== "string") return false;

  let dataObj;
  try {
    dataObj = JSON.parse(data);
  } catch {
    return false;
  }

  if (
    !isPlainObject(dataObj) ||
    !isUUIDv4(dataObj.userId) ||
    typeof dataObj.username !== "string"
  ) {
    return false;
  }

  if (typeof iat !== "number" || typeof exp !== "number") return false;
  if (exp <= iat) return false;

  const now = Math.floor(Date.now() / 1000);
  if (exp <= now) return false;

  return true;
}

// Validate payload from output of verified refresh token
export function isDecodedRefreshToken(value: any): value is StringTokenPayload {
  if (!isPlainObject(value)) return false;

  const { data, iat, exp } = value;
  if (typeof data !== "string") return false;

  let dataObj;
  try {
    dataObj = JSON.parse(data);
  } catch {
    return false;
  }

  if (
    !isPlainObject(dataObj) ||
    !isUUIDv4(dataObj.userId) ||
    typeof dataObj.accessToken !== "string"
  ) {
    return false;
  }

  if (typeof iat !== "number" || typeof exp !== "number") return false;
  if (exp <= iat) return false;

  const now = Math.floor(Date.now() / 1000);
  if (exp <= now) return false;

  return true;
}

// Validate create a new myself conversation
export function validateCreateMyselfConversation(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!isPlainObject(value?.metadata)) {
    return {
      valid: false,
      message: "Myself conversation must include metadata object",
    };
  }
  if (typeof value.metadata.name !== "string") {
    return {
      valid: false,
      message: "Group conversation metadata must include a string 'name'",
    };
  }

  return { valid: true };
}

// Validate create a new group conversation
export function validateCreateGroupConversation(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!Array.isArray(value?.participantIds)) {
    return { valid: false, message: "ParticipantIds must be an array" };
  }

  if (!value.participantIds.every((p: any) => isUUIDv4(p))) {
    return { valid: false, message: "All participantIds must be strings" };
  }

  if (!isPlainObject(value?.metadata)) {
    return {
      valid: false,
      message: "Group conversation must include metadata object",
    };
  }

  if (typeof value.metadata.name !== "string") {
    return {
      valid: false,
      message: "Group conversation metadata must include a string 'name'",
    };
  }

  if (value.participantIds.length < 3) {
    return {
      valid: false,
      message: "Group conversation must have at least 3 participants",
    };
  }

  return { valid: true };
}

// Validate send message response
export function validateSendMessageInput(
  conversation: ConversationIdentifier,
  message: string
) {
  if (!isUUIDv4(conversation.id)) {
    return {
      valid: false,
      message: "Conversation id must be a uuidv4.",
    };
  }
  if (!isTypeConversationEnum(conversation.type)) {
    return {
      valid: false,
      message: "conversation.type must be a 'myself', 'direct' or 'group'.",
    };
  }
  if (typeof message !== "string") {
    return { valid: false, message: "message must be a string" };
  }

  return { valid: true };
}

// Validate add participants request
export function validateAddParticipants(
  conversation: ConversationIdentifier,
  participantIds: string[]
) {
  if (!isUUIDv4(conversation.id)) {
    return {
      valid: false,
      message: "Conversation id must be a uuidv4.",
    };
  }
  if (!isTypeConversationEnum(conversation.type)) {
    return {
      valid: false,
      message: "conversation.type must be a 'myself', 'direct' or 'group'.",
    };
  }
  for (const userId of participantIds) {
    if (!isUUIDv4(userId)) {
      return {
        valid: false,
        message: "Participant id must be a uuidv4.",
      };
    }
  }

  return { valid: true };
}

// ============================================================
// Validate result from database server returned
// ============================================================
export function isPgError(err: unknown): err is PgError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as any).code === "string"
  );
}

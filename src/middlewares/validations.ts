import type {
  StringTokenPayload,
  HttpRegisterPost,
  HttpLoginPost,
  ConversationIdentifier,
} from "../types";
import { ConversationType } from "../types";

// Pure function
export function isPlainObject(value: any): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUUIDv4(value: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value);
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

// Validate payload from output of verify token
export function isDecodedJWT(value: any): value is StringTokenPayload {
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

// Validate register request
export function isRegisterInput(data: any): data is HttpRegisterPost {
  return (
    data &&
    typeof data.name === "string" &&
    isEmail(data.email) &&
    isUsername(data.username) &&
    isPassword(data.password)
  );
}

// Validate login request
export function isLoginInput(data: any): data is HttpLoginPost {
  return data && isUsername(data.username) && isPassword(data.password);
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

// Validate create a new direct conversation
export function validateCreateDirectConversation(
  value: any
): { valid: true } | { valid: false; message: string } {
  if (!Array.isArray(value?.participants)) {
    return { valid: false, message: "Participants must be an array" };
  }
  if (!value.participants.every((p: any) => isUUIDv4(p))) {
    return { valid: false, message: "All participants must be strings" };
  }
  if (value.participants.length !== 2) {
    return {
      valid: false,
      message: "Direct conversation had exactly two participants.",
    };
  }
  if (value.participants[0] === value.participants[1]) {
    return {
      valid: false,
      message: "A user appears twice.",
    };
  }

  return { valid: true };
}

// Validate create a new group conversation
export function validateCreateGroupConversation(
  value: any,
  creator: string
): { valid: true } | { valid: false; message: string } {
  if (!Array.isArray(value?.participants)) {
    return { valid: false, message: "Participants must be an array" };
  }
  if (!value.participants.every((p: any) => isUUIDv4(p))) {
    return { valid: false, message: "All participants must be strings" };
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
  if (value.participants.length < 3) {
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
  if (!isUUIDv4(conversation.conversationId)) {
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

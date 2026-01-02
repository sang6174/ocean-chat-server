import { ConversationType } from "../../types/domain";

import { ValidateError } from "../../helpers/errors";
import { logger } from "../../helpers/logger";

export function assertValid(
  result: { valid: true } | { valid: false; message: string },
  name = "value"
): asserts result is { valid: true } {
  if (!result.valid) {
    logger.info(`Validation failed for ${name}: ${result.message}`);
    throw new ValidateError(`Validate failed for ${name}: ${result.message}`);
  } else {
    logger.info(`Validate successfully for ${name}}`);
  }
}

export function isNumber(value: any): value is number {
  return typeof value === "number";
}

export function isString(value: any): value is string {
  return typeof value === "string";
}

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
  minLength = 2,
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

export function isTypeConversationEnum(value: any): value is ConversationType {
  return Object.values(ConversationType).includes(value);
}
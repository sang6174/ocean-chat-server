import type { HttpRegisterPost, HttpLoginPost } from "../types/http";
import type { UserTokenPayload, RefreshTokenPayload } from "../types/domain";
import { isPlainObject } from "./validations";

export function assertRegisterBody(
  data: unknown
): asserts data is HttpRegisterPost {
  if (data === null || typeof data !== "object") {
    throw new Error("Request body must be an object");
  }

  const body = data as Record<string, unknown>;

  if (typeof body.email !== "string") {
    throw new Error("Field 'email' must be a string");
  }

  if (typeof body.username !== "string") {
    throw new Error("Field 'username' must be a string");
  }

  if (typeof body.password !== "string") {
    throw new Error("Field 'password' must be a string");
  }
}

export function assertLoginBody(data: unknown): asserts data is HttpLoginPost {
  if (!isPlainObject(data)) {
    throw new Error("Request body must be an object");
  }

  if (typeof data.username !== "string") {
    throw new Error("Field 'username' must be a string");
  }

  if (typeof data.password !== "string") {
    throw new Error("Field 'password' must be a string");
  }
}

export function assertUserTokenPayload(
  value: unknown
): asserts value is UserTokenPayload {
  if (typeof value !== "object" || value === null) {
    throw new Error("UserTokenPayload must be an object");
  }

  const v = value as any;

  if (typeof v.data !== "object" || v.data === null) {
    throw new Error("UserTokenPayload.data must be an object");
  }

  if (typeof v.data.userId !== "string") {
    throw new Error("UserTokenPayload.data.userId must be a string");
  }

  if (typeof v.data.username !== "string") {
    throw new Error("UserTokenPayload.data.username must be a string");
  }

  if (typeof v.iat !== "number") {
    throw new Error("UserTokenPayload.iat must be a number");
  }

  if (typeof v.exp !== "number") {
    throw new Error("UserTokenPayload.exp must be a number");
  }
}

export function assertRefreshTokenPayload(
  value: unknown
): asserts value is RefreshTokenPayload {
  if (typeof value !== "object" || value === null) {
    throw new Error("RefreshTokenPayload must be an object");
  }

  const v = value as any;

  if (typeof v.iat !== "number") {
    throw new Error("RefreshTokenPayload.iat must be a number");
  }

  if (typeof v.exp !== "number") {
    throw new Error("RefreshTokenPayload.exp must be a number");
  }

  if (typeof v.data !== "object" || v.data === null) {
    throw new Error("RefreshTokenPayload.data must be an object");
  }

  if (typeof v.data.userId !== "string") {
    throw new Error("RefreshTokenPayload.data.userId must be a string");
  }

  if (typeof v.data.accessToken !== "string") {
    throw new Error("RefreshTokenPayload.data.accessToken must be a string");
  }
}

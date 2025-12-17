import type { HttpRegisterPost, HttpLoginPost } from "../types/http";
import { isPlainObject } from "./validations";

export function assertRegisterBody(
  data: unknown
): asserts data is HttpRegisterPost {
  if (data === null || typeof data !== "object") {
    throw new Error("Request body must be an object");
  }

  const body = data as Record<string, unknown>;

  if (typeof body.name !== "string") {
    throw new Error("Field 'name' must be a string");
  }

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

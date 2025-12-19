import type { ResponseDomain } from "../types/domain";
import { logger } from "../helpers/logger";
import { isPlainObject } from "./validation/helper";

export async function safeFormData(req: Request) {
  try {
    return await req.formData();
  } catch (err) {
    logger.error("Form-data parse error");
    return null;
  }
}

export async function parseBodyFormData(req: Request) {
  const form = await safeFormData(req);

  if (!form) {
    return {
      status: 400,
      code: "PARSE_BODY_ERROR",
      message:
        "Invalid request body. Please submit the data using multipart/form-data.",
    };
  }

  logger.info("Form-data parse successfully");
  return form;
}

export async function safeJSON(req: Request): Promise<object | null> {
  try {
    const data = await req.json();
    if (!isPlainObject(data)) {
      return null;
    }

    return data;
  } catch (err) {
    logger.error("JSON parse error");
    return null;
  }
}

export async function parseBodyJSON<T = any>(
  req: Request
): Promise<ResponseDomain | T> {
  const body = (await safeJSON(req)) as T | null;

  if (!body) {
    return {
      status: 400,
      code: "PARSE_BODY_ERROR",
      message: "Invalid request body. Please send a valid JSON object.",
    };
  }

  logger.info("JSON parse successfully");
  return body;
}

export function parseAuthToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    const url = new URL(req.url);
    token = url.searchParams.get("token");
  }

  if (!token) {
    return {
      status: 401,
      code: "AUTHENTICATE_FAILED",
      message: "Missing or invalid authentication token",
    };
  }

  logger.info("Token parse successfully");
  return token;
}

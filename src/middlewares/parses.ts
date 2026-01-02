import type { ResponseDomain } from "../types/domain";
import { logger } from "../helpers/logger";
import { isPlainObject } from "./validation/helper";
import { ParseError } from "../helpers/errors";

export async function safeFormData(req: Request) {
  try {
    return await req.formData();
  } catch (err) {
    logger.error("Parse form-data body error");
    throw new ParseError("Parse form-data body error");
  }
}

export async function parseBodyFormData(req: Request) {
  const form = await safeFormData(req);
  logger.info("Form-data body parsed successfully");
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
    logger.error("Parse JSON body error");
    throw new ParseError("Parse JSON body error");
  }
}

export async function parseBodyJSON<T = any>(req: Request): Promise<T> {
  const body = (await safeJSON(req)) as T;
  logger.info("JSON body parsed successfully");
  return body;
}

export function extractAndParseAccessToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    const url = new URL(req.url);
    token = url.searchParams.get("token");
  }

  if (!token) {
    throw new ParseError(
      "Missing token in authorization header or search params"
    );
  }

  logger.info("Successfully extract and parse auth token");
  return token;
}

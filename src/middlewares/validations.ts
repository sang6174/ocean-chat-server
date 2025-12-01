import type { StringTokenPayload } from "../types";

// Pure function
export function isPlainObject(value: any): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUUIDv4(value: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value);
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

import type { UserTokenPayload } from "../types";
import { verifyAccessToken, verifyRefreshToken } from "../services";
import { isDecodedJWT } from "./validations";

export function authMiddleware(token: string): UserTokenPayload | null {
  try {
    const decoded = verifyAccessToken(token);

    if (!isDecodedJWT(decoded)) {
      console.log("Access token is invalid: ", decoded);
      return null;
    }

    return {
      ...decoded,
      data: JSON.parse(decoded.data),
    };
  } catch (err) {
    console.log("Verify auth token error: ", err);
    return null;
  }
}

export function refreshTokenMiddleware(token: string): UserTokenPayload | null {
  try {
    const decoded = verifyRefreshToken(token);

    if (!isDecodedJWT(decoded)) {
      console.log("Access token is invalid: ", decoded);
      return null;
    }

    return {
      ...decoded,
      data: JSON.parse(decoded.data),
    } as UserTokenPayload;
  } catch (err) {
    console.log("Verify refresh token error: ", err);
    return null;
  }
}

import type { RefreshTokenPayload, UserTokenPayload } from "../types/domain";
import { verifyAccessToken, verifyRefreshToken } from "../services";
import { isDecodedAuthToken, isDecodedRefreshToken } from "./validations";

export function authMiddleware(token: string): UserTokenPayload | null {
  try {
    const decoded = verifyAccessToken(token);

    if (!isDecodedAuthToken(decoded)) {
      console.log(
        `[MIDDLEWARE_ERROR] - ${new Date().toISOString()} - Payload in auth token is invalid.\n`,
        decoded
      );
      return null;
    }

    return {
      ...decoded,
      data: JSON.parse(decoded.data),
    };
  } catch (err) {
    console.log(
      `[MIDDLEWARE_ERROR] - ${new Date().toISOString()} - Verify auth token error.\n`,
      err
    );
    return null;
  }
}

export function refreshTokenMiddleware(
  token: string
): RefreshTokenPayload | null {
  try {
    const decoded = verifyRefreshToken(token);

    if (!isDecodedRefreshToken(decoded)) {
      console.log(
        `[MIDDLEWARE_ERROR] - ${new Date().toISOString()} - Payload in refresh token is invalid.\n`,
        decoded
      );
      return null;
    }

    return {
      ...decoded,
      data: JSON.parse(decoded.data),
    } as RefreshTokenPayload;
  } catch (err) {
    console.log(
      `[MIDDLEWARE_ERROR] - ${new Date().toISOString()} - Verify refresh token error.\n`,
      err
    );
    return null;
  }
}

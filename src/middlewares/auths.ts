import type { RefreshTokenPayload, UserTokenPayload } from "../types/domain";
import { verifyAccessToken, verifyRefreshToken } from "../services";
import { isDecodedAuthToken, isDecodedRefreshToken } from "./validations";

export function authMiddleware(token: string): UserTokenPayload | null {
  try {
    const decoded = verifyAccessToken(token);

    if (!isDecodedAuthToken(decoded)) {
      return null;
    }

    return {
      ...decoded,
      data: JSON.parse(decoded.data),
    };
  } catch (err) {
    return null;
  }
}

export function refreshTokenMiddleware(
  token: string
): RefreshTokenPayload | null {
  try {
    const decoded = verifyRefreshToken(token);

    if (!isDecodedRefreshToken(decoded)) {
      return null;
    }

    return {
      ...decoded,
      data: JSON.parse(decoded.data),
    } as RefreshTokenPayload;
  } catch (err) {
    return null;
  }
}

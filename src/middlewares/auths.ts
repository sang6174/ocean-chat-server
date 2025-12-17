import type { RefreshTokenPayload, UserTokenPayload } from "../types/domain";
import { verifyAccessToken, verifyRefreshToken } from "../services";
import {
  isDecodedAuthToken,
  validateAuthToken,
  isDecodedRefreshToken,
  validateRefreshToken,
} from "./validations";
import {
  assertUserTokenPayload,
  assertRefreshTokenPayload,
} from "../middlewares/asserts";
import { blacklistSessions } from "../models";

export function authMiddleware(token: string): UserTokenPayload | null {
  try {
    if (!blacklistSessions.has(token)) {
      return null;
    }

    const decoded = verifyAccessToken(token);

    if (!isDecodedAuthToken(decoded)) {
      return null;
    }

    const validateResult = validateAuthToken(decoded);
    if (!validateResult.valid) {
      return null;
    }

    assertUserTokenPayload({
      ...decoded,
      data: JSON.parse(decoded.data),
    });

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

    const validateResult = validateRefreshToken(decoded);
    if (!validateResult.valid) {
      return null;
    }

    assertRefreshTokenPayload({
      ...decoded,
      data: JSON.parse(decoded.data),
    });

    return {
      ...decoded,
      data: JSON.parse(decoded.data),
    };
  } catch (err) {
    return null;
  }
}

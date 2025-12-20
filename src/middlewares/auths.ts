import type { RefreshTokenPayload, UserTokenPayload } from "../types/domain";
import { verifyAccessToken, verifyRefreshToken } from "../services";
import {
  isDecodedAuthToken,
  validateAuthToken,
  isDecodedRefreshToken,
  validateRefreshToken,
  assertUserTokenPayload,
  assertRefreshTokenPayload,
} from "./validation/domain";
import { logger } from "../helpers/logger";

import { blacklistSessions } from "../models";
import { AuthError } from "../helpers/errors";

export function authMiddleware(token: string): UserTokenPayload | null {
  try {
    if (blacklistSessions.has(token)) {
      logger.info("The auth token is on the blacklist");
      return null;
    }

    const decoded = verifyAccessToken(token);
    if (!isDecodedAuthToken(decoded)) {
      logger.error("Decoded of auth token is invalid ...");
      return null;
    }

    const validateResult = validateAuthToken(decoded);
    if (!validateResult.valid) {
      logger.error("Decoded of auth token is invalid");
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
    logger.error("Decoded of auth token is invalid ...");
    throw err;
  }
}

export function refreshTokenMiddleware(
  token: string
): RefreshTokenPayload | null {
  try {
    const decoded = verifyRefreshToken(token);

    if (!isDecodedRefreshToken(decoded)) {
      logger.error("Decoded of refresh token is invalid");
      return null;
    }

    const validateResult = validateRefreshToken(decoded);
    if (!validateResult.valid) {
      logger.error("Decoded of refresh token is invalid");
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
    logger.error("Decoded of refresh token is invalid");
    throw new AuthError("Failed to verify auth token");
  }
}

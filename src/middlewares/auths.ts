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
      logger.info("The token is on the blacklist");
      return null;
    }

    const decoded = verifyAccessToken(token);
    if (!isDecodedAuthToken(decoded)) {
      logger.info("Decoded of token is invalid");
      return null;
    }

    const validateResult = validateAuthToken(decoded);
    if (!validateResult.valid) {
      logger.info("Decoded of token is invalid");
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
    logger.info("Decoded of token is invalid");
    throw new AuthError("Failed to verify auth token");
  }
}

export function refreshTokenMiddleware(
  token: string
): RefreshTokenPayload | null {
  try {
    const decoded = verifyRefreshToken(token);

    if (!isDecodedRefreshToken(decoded)) {
      logger.info("Decoded of token is invalid");
      return null;
    }

    const validateResult = validateRefreshToken(decoded);
    if (!validateResult.valid) {
      logger.info("Decoded of token is invalid");
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
    logger.info("Decoded of token is invalid");
    throw new AuthError("Failed to verify auth token");
  }
}

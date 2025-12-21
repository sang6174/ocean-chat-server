import type { RefreshTokenPayload, UserTokenPayload } from "../types/domain";
import { verifyAccessToken, verifyRefreshToken } from "../services";
import {
  isDecodedToken,
  validateAuthToken,
  validateRefreshToken,
  assertUserTokenPayload,
  assertRefreshTokenPayload,
} from "./validation/domain";
import { logger } from "../helpers/logger";

import { blacklistAuthToken, blacklistRefreshToken } from "../models";
import { AuthError } from "../helpers/errors";

export function authMiddleware(token: string): UserTokenPayload {
  try {
    if (blacklistAuthToken.has(token)) {
      logger.warn("The auth token is on the blacklist");
      throw new AuthError("Auth token is invalid");
    }

    const decoded = verifyAccessToken(token);
    if (!isDecodedToken(decoded)) throw new AuthError("Auth token is invalid");

    const validateResult = validateAuthToken(decoded);
    if (!validateResult.valid) throw new AuthError("Auth token has expired");
    const payload = {
      ...decoded,
      data: JSON.parse(decoded.data),
    };

    assertUserTokenPayload(payload);

    return payload;
  } catch (err) {
    throw err;
  }
}

export function refreshTokenMiddleware(token: string): RefreshTokenPayload {
  try {
    if (blacklistRefreshToken.has(token)) {
      logger.warn("The refresh token is on the blacklist");
      throw new AuthError("Refresh token is invalid");
    }

    const decoded = verifyRefreshToken(token);
    if (!isDecodedToken(decoded))
      throw new AuthError("Refresh token is invalid");

    const validateResult = validateRefreshToken(decoded);
    if (!validateResult.valid) throw new AuthError("Refresh token has expired");
    const payload = {
      ...decoded,
      data: JSON.parse(decoded.data),
    };

    assertRefreshTokenPayload(payload);

    return payload;
  } catch (err) {
    throw err;
  }
}

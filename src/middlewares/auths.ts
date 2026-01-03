import type { RefreshTokenPayload, UserTokenPayload } from "../types/domain";
import { verifyAccessToken, verifyRefreshToken } from "../services";
import {
  isDecodedToken,
  assertUserTokenPayload,
  assertRefreshTokenPayload,
} from "./validation/domain";
import { logger } from "../helpers/logger";

import { blacklistAccessToken, blacklistRefreshToken } from "../models";
import { AuthError } from "../helpers/errors";

export function checkAccessTokenMiddleware(token: string): UserTokenPayload {
  try {
    if (blacklistAccessToken.has(token)) {
      logger.warn("The access token is on the blacklist");
      throw new AuthError("Access token is invalid");
    }

    const decoded = verifyAccessToken(token);
    if (!isDecodedToken(decoded))
      throw new AuthError("Access token is invalid");

    const payload = {
      ...decoded,
      data: JSON.parse(decoded.data),
    };

    assertUserTokenPayload(payload);

    return payload;
  } catch (err: any) {
    logger.error("Verify JWT access token error: ", err?.message);
    throw err;
  }
}

export function checkRefreshTokenMiddleware(
  token: string
): RefreshTokenPayload {
  try {
    if (blacklistRefreshToken.has(token)) {
      logger.warn("The refresh token is on the blacklist");
      throw new AuthError("Refresh token is invalid");
    }

    const decoded = verifyRefreshToken(token);
    if (!isDecodedToken(decoded))
      throw new AuthError("Refresh token is invalid");

    const payload = {
      ...decoded,
      data: JSON.parse(decoded.data),
    };

    assertRefreshTokenPayload(payload);

    return payload;
  } catch (err: any) {
    logger.error("Verify JWT refresh token error: ", err?.message);
    throw err;
  }
}

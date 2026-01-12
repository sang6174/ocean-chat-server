import type { RefreshTokenPayload, UserTokenPayload } from "../types/domain";
import { verifyAccessToken, verifyRefreshToken } from "../services";
import {
  isDecodedToken,
  assertUserTokenPayload,
  assertRefreshTokenPayload,
} from "./validation/domain";
import { logger } from "../helpers/logger";

import { AuthError } from "../helpers/errors";

export function checkAccessTokenMiddleware(token: string): UserTokenPayload {
  try {
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

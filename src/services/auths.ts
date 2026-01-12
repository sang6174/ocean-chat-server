import * as jwt from "jsonwebtoken";

import type {
  ResponseDomain,
  RegisterDomainInput,
  RegisterDomainOutput,
  LoginDomainInput,
  LoginDomainOutput,
  LogoutDomainInput,
  GenerateAuthTokenDomainInput,
  GenerateAuthTokenDomainOutput,
  RegisterRepositoryInput,
} from "../types/domain";
import {
  findAccountByUsername,
  findAccountByUserId,
  registerRepository,
  insertFreshTokenRepository,
  findRefreshTokenRepository,
  rotateRefreshTokenRepository,
  revokeRefreshTokenRepository,
} from "../repository";
import { DomainError } from "../helpers/errors";
import { logger } from "../helpers/logger";
import { hashRefreshToken } from "../helpers/helpers";

export const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
export const accessTokenExpiresIn = process.env
  .ACCESS_TOKEN_EXPIRES_IN! as jwt.SignOptions["expiresIn"];

export const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
export const refreshTokenExpiresIn = process.env
  .REFRESH_TOKEN_EXPIRES_IN! as jwt.SignOptions["expiresIn"];

export const refreshTokenMaxAge = Number(process.env.REFRESH_TOKEN_MAX_AGE!);

export function createAccessToken(
  payload: string,
  secret: string = accessTokenSecret,
  expiresIn: jwt.SignOptions["expiresIn"] = accessTokenExpiresIn
): string {
  return jwt.sign({ data: payload }, secret, { expiresIn });
}

export function createRefreshToken(
  payload: string,
  secret: string = refreshTokenSecret,
  expiresIn: jwt.SignOptions["expiresIn"] = refreshTokenExpiresIn
): string {
  return jwt.sign({ data: payload }, secret, { expiresIn });
}

export function verifyAccessToken(
  token: string,
  secret: string = accessTokenSecret
): string | jwt.JwtPayload {
  return jwt.verify(token, secret);
}

export function verifyRefreshToken(
  token: string,
  secret: string = refreshTokenSecret
): string | jwt.JwtPayload {
  return jwt.verify(token, secret);
}

export async function registerService(
  input: RegisterDomainInput
): Promise<RegisterDomainOutput> {
  const hashedPassword: string = await Bun.password.hash(input.password);
  const inputRepo: RegisterRepositoryInput = {
    name: input.name,
    email: input.email,
    username: input.username,
    password: hashedPassword,
  };

  const result = await registerRepository(inputRepo);
  return result;
}

export async function loginService(
  input: LoginDomainInput
): Promise<LoginDomainOutput> {
  const existingAccount = await findAccountByUsername({
    username: input.username,
  });

  if (!existingAccount) {
    throw new DomainError({
      status: 400,
      code: "ACCOUNT_INVALID",
      message: "Account is invalid",
    });
  }

  const isMatchPassword = await Bun.password.verify(
    input.password,
    existingAccount.password
  );

  if (!isMatchPassword) {
    throw new DomainError({
      status: 401,
      code: "PASSWORD_INVALID",
      message: "Password is invalid",
    });
  }

  const accessToken: string = createAccessToken(
    JSON.stringify({
      userId: existingAccount.userId,
      username: existingAccount.username,
    })
  );
  logger.warn("Create a new access token successfully");

  const refreshTokenId = crypto.randomUUID();
  const refreshToken = createRefreshToken(
    JSON.stringify({
      userId: existingAccount.userId,
      jti: refreshTokenId,
    })
  );
  logger.warn("Create a new refresh token successfully");

  const refreshTokenHash = hashRefreshToken(refreshToken);
  await insertFreshTokenRepository({
    id: refreshTokenId,
    userId: existingAccount.userId,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + refreshTokenMaxAge),
  });

  return {
    userId: existingAccount.userId,
    username: existingAccount.username,
    accessToken,
    refreshToken,
  };
}

export async function generateAuthTokenService(
  input: GenerateAuthTokenDomainInput
): Promise<GenerateAuthTokenDomainOutput> {
  const existingAccount = await findAccountByUserId({
    userId: input.userId,
  });

  if (!existingAccount) {
    throw new DomainError({
      status: 400,
      code: "ACCOUNT_INVALID",
      message: "Account is invalid",
    });
  }

  const oldRefreshTokenHash = hashRefreshToken(input.refreshToken);
  const oldRefreshToken = await findRefreshTokenRepository({
    tokenHash: oldRefreshTokenHash,
  });

  if (!oldRefreshToken) {
    throw new DomainError({
      status: 401,
      code: "REFRESH_TOKEN_INVALID",
      message: "Refresh token is invalid",
    });
  }

  if (oldRefreshToken.userId !== input.userId) {
    logger.warn(`Refresh token userId mismatch.`, {
      clientUserId: input.userId,
      tokenUserId: oldRefreshToken.userId,
    });

    throw new DomainError({
      status: 401,
      code: "REFRESH_TOKEN_INVALID",
      message: "Refresh token is invalid",
    });
  }

  if (oldRefreshToken.revokedAt || oldRefreshToken.expiresAt < new Date()) {
    logger.warn(`Refresh token reuse.`);
  }

  const accessToken: string = createAccessToken(
    JSON.stringify({
      userId: existingAccount.userId,
      username: existingAccount.username,
    })
  );
  logger.warn("Create a new access token successfully");

  const refreshTokenId = crypto.randomUUID();
  const refreshToken = createRefreshToken(
    JSON.stringify({
      userId: existingAccount.userId,
      jti: refreshTokenId,
    })
  );
  logger.warn("Create a new refresh token successfully");

  const refreshTokenHash = hashRefreshToken(refreshToken);
  await rotateRefreshTokenRepository({
    oldRefreshTokenId: oldRefreshToken.id,
    newRefreshTokenId: refreshTokenId,
    userId: input.userId,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + refreshTokenMaxAge),
  });

  logger.debug("Generate auth token successfully");
  return {
    userId: existingAccount.id,
    username: existingAccount.username,
    accessToken,
    refreshToken,
  };
}

export async function logoutService(
  input: LogoutDomainInput
): Promise<ResponseDomain> {
  const tokenHash = hashRefreshToken(input.refreshToken);
  const refreshToken = await findRefreshTokenRepository({ tokenHash });

  if (!refreshToken) {
    throw new DomainError({
      status: 401,
      code: "REFRESH_TOKEN_INVALID",
      message: "Refresh token is invalid",
    });
  }

  if (refreshToken.userId !== input.userId) {
    logger.warn(`Refresh token userId mismatch.`, {
      clientUserId: input.userId,
      tokenUserId: refreshToken.userId,
    });

    throw new DomainError({
      status: 401,
      code: "REFRESH_TOKEN_INVALID",
      message: "Refresh token is invalid",
    });
  }

  await revokeRefreshTokenRepository({ tokenId: refreshToken.id });

  return {
    status: 200,
    code: "LOGOUT_SUCCESS",
    message: "Logout is successful.",
  };
}

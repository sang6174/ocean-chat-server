import * as jwt from "jsonwebtoken";

import type {
  ResponseDomain,
  RegisterDomainInput,
  RegisterDomainOutput,
  LoginDomainInput,
  LoginDomainOutput,
  LogoutDomainInput,
  GenerateAccessTokenInput,
  GenerateAccessTokenOutput,
  RegisterRepositoryInput,
} from "../types/domain";
import {
  findAccountByUsername,
  findAccountById,
  registerRepository,
  getProfileUserRepository,
} from "../repository";
import { blacklistAccessToken, blacklistRefreshToken } from "../models";
import { DomainError } from "../helpers/errors";
import { logger } from "../helpers/logger";

export const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
export const accessTokenExpiresIn = process.env
  .ACCESS_TOKEN_EXPIRES_IN! as jwt.SignOptions["expiresIn"];

export const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
export const refreshTokenExpiresIn = process.env
  .REFRESH_TOKEN_EXPIRES_IN! as jwt.SignOptions["expiresIn"];

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
  logger.debug("Verify auth token error.");
  return jwt.verify(token, secret);
}

export function verifyRefreshToken(
  token: string,
  secret: string = refreshTokenSecret
): string | jwt.JwtPayload {
  logger.debug("Verify refresh token error.");
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

  console.log(existingAccount);

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
  logger.warn("Generate a new auth token successfully");

  const refreshToken: string = createRefreshToken(
    JSON.stringify({
      userId: existingAccount.userId,
      accessToken: accessToken,
    })
  );
  logger.warn("Generate a new refresh token successfully");

  const userProfile = await getProfileUserRepository({
    userId: existingAccount.userId,
  });

  return {
    userId: existingAccount.userId,
    username: existingAccount.username,
    accessToken,
    refreshToken,
  };
}

export async function generateAccessTokenService(
  input: GenerateAccessTokenInput
): Promise<GenerateAccessTokenOutput> {
  const existingAccount = await findAccountById({
    id: input.userId,
  });

  if (!existingAccount) {
    throw new DomainError({
      status: 400,
      code: "ACCOUNT_INVALID",
      message: "Account is invalid",
    });
  }

  const accessToken: string = createAccessToken(
    JSON.stringify({
      userId: existingAccount.id,
      username: existingAccount.username,
    })
  );

  logger.warn("Generate a new auth token successfully");

  return {
    userId: existingAccount.id,
    username: existingAccount.username,
    accessToken,
  };
}

export async function logoutService(
  input: LogoutDomainInput
): Promise<ResponseDomain> {
  if (!blacklistAccessToken.has(input.accessToken)) {
    blacklistAccessToken.add(input.accessToken);
  }

  if (!blacklistRefreshToken.has(input.refreshToken)) {
    blacklistRefreshToken.add(input.refreshToken);
  }

  return {
    status: 200,
    code: "LOGOUT_SUCCESS",
    message: "Logout is successful.",
  };
}

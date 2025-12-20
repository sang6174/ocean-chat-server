import * as jwt from "jsonwebtoken";

import type {
  ResponseDomain,
  RegisterDomainInput,
  RegisterDomainOutput,
  LoginDomainInput,
  LoginDomainOutput,
  LogoutDomainInput,
  RefreshAuthTokenInput,
  RefreshAuthTokenOutput,
  RegisterRepositoryInput,
} from "../types/domain";
import {
  findAccountByUsername,
  findAccountById,
  registerRepository,
} from "../repository";
import { blacklistSessions } from "../models";
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

  const authToken: string = createAccessToken(
    JSON.stringify({
      userId: existingAccount.id,
      username: existingAccount.username,
    })
  );
  logger.warn("Generate a new auth token successfully");

  const refreshToken: string = createRefreshToken(
    JSON.stringify({
      userId: existingAccount.id,
      authToken,
    })
  );
  logger.warn("Generate a new refresh token successfully");

  return {
    userId: existingAccount.id,
    username: existingAccount.username,
    authToken: authToken,
    refreshToken,
  };
}

export async function logoutService(
  input: LogoutDomainInput
): Promise<ResponseDomain> {
  if (blacklistSessions.has(input.userId)) {
    blacklistSessions.get(input.userId)?.push(input.authToken);
  } else {
    blacklistSessions.set(input.userId, [input.authToken]);
  }

  return {
    status: 200,
    code: "LOGOUT_SUCCESS",
    message: "Logout is successful.",
  };
}

export async function refreshAuthTokenService(
  input: RefreshAuthTokenInput
): Promise<RefreshAuthTokenOutput> {
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

  const authToken: string = createAccessToken(
    JSON.stringify({
      userId: existingAccount.id,
      username: existingAccount.username,
    })
  );
  logger.warn("Generate a new auth token successfully");

  return {
    userId: existingAccount.id,
    username: existingAccount.username,
    authToken: authToken,
  };
}

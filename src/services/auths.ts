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
  PgErrorRepositoryOutput,
  RegisterRepositoryInput,
} from "../types/domain";
import type { BaseLogger } from "../helpers/logger";
import {
  findAccountByUsername,
  findAccountById,
  registerRepository,
} from "../repository";
import { blacklistSessions } from "../models";

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
  baseLogger: BaseLogger,
  input: RegisterDomainInput
): Promise<RegisterDomainOutput | PgErrorRepositoryOutput | null> {
  const hashedPassword: string = await Bun.password.hash(input.password);
  const inputRepo: RegisterRepositoryInput = {
    name: input.name,
    email: input.email,
    username: input.username,
    password: hashedPassword,
  };

  const result = await registerRepository(baseLogger, inputRepo);
  return result;
}

export async function loginService(
  baseLogger: BaseLogger,
  input: LoginDomainInput
): Promise<LoginDomainOutput | ResponseDomain | null> {
  try {
    const existingAccount = await findAccountByUsername(baseLogger, {
      username: input.username,
    });
    if (!existingAccount) {
      return { status: 404, message: "Account not found." };
    }

    const isMatchPassword = await Bun.password.verify(
      input.password,
      existingAccount.password
    );
    if (!isMatchPassword) {
      return { status: 401, message: "Password is invalid" };
    }

    const accessToken: string = createAccessToken(
      JSON.stringify({
        userId: existingAccount.id,
        username: existingAccount.username,
      })
    );

    const refreshToken: string = createRefreshToken(
      JSON.stringify({
        userId: existingAccount.id,
        accessToken,
      })
    );

    return {
      userId: existingAccount.id,
      username: existingAccount.username,
      accessToken,
      refreshToken,
    };
  } catch (err) {
    return null;
  }
}

export async function logoutService(
  baseLogger: BaseLogger,
  input: LogoutDomainInput
): Promise<ResponseDomain> {
  try {
    // Add auth token into blacklist
    if (blacklistSessions.has(input.userId)) {
      blacklistSessions.get(input.userId)?.push(input.authToken);
    } else {
      blacklistSessions.set(input.userId, [input.authToken]);
    }

    return {
      status: 200,
      message: "Logout is successful.",
    };
  } catch (err) {
    return {
      status: 500,
      message: "Failed to logout. Please try again.",
    };
  }
}

export async function refreshAuthTokenService(
  baseLogger: BaseLogger,
  input: RefreshAuthTokenInput
): Promise<RefreshAuthTokenOutput | ResponseDomain | null> {
  try {
    const existingAccount = await findAccountById(baseLogger, {
      id: input.userId,
    });
    if (!existingAccount) {
      return { status: 400, message: "Account not found." };
    }

    const authToken: string = createAccessToken(
      JSON.stringify({
        userId: existingAccount.id,
        username: existingAccount.username,
      })
    );

    return {
      userId: existingAccount.id,
      username: existingAccount.username,
      authToken: authToken,
    };
  } catch (err) {
    return null;
  }
}

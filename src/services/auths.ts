import * as jwt from "jsonwebtoken";

import type {
  ResponseDomain,
  RegisterDomainInput,
  RegisterDomainOutput,
  LoginDomainInput,
  LoginDomainOutput,
  LogoutDomainInput,
  RefreshAccessTokenInput,
  RefreshAccessTokenOutput,
} from "../types/domain";
import {
  findUserByEmail,
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

export async function registerService({
  name,
  email,
  username,
  password,
}: RegisterDomainInput): Promise<RegisterDomainOutput | ResponseDomain | null> {
  try {
    const existingUser = await findUserByEmail({ email });
    if (existingUser) {
      return {
        status: 409,
        message: "Email is already in use. Please use a different email.",
      };
    }

    const existingAccount = await findAccountByUsername({ username });
    if (existingAccount) {
      return {
        status: 409,
        message: "Username is already in use. Please use a different username.",
      };
    }

    const hashedPassword: string = await Bun.password.hash(password);
    const result = await registerRepository({
      name,
      email,
      username,
      password: hashedPassword,
    });
    return result;
  } catch (err) {
    console.log(
      `[API_SERVICE_ERROR] - ${new Date().toISOString()} - Register service error.\n`,
      err
    );
    return null;
  }
}

export async function loginService({
  username,
  password,
}: LoginDomainInput): Promise<LoginDomainOutput | ResponseDomain | null> {
  try {
    const existingAccount = await findAccountByUsername({ username });
    if (!existingAccount) {
      return { status: 404, message: "Account not found." };
    }

    const isMatchPassword = await Bun.password.verify(
      password,
      existingAccount.password
    );
    if (!isMatchPassword) {
      return { status: 401, message: "Account is invalid" };
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
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Login service error.\n`,
      err
    );
    return null;
  }
}

export async function logoutService({
  userId,
  accessToken,
}: LogoutDomainInput): Promise<ResponseDomain> {
  try {
    // Add auth token into blacklist
    if (blacklistSessions.has(userId)) {
      blacklistSessions.get(userId)?.push(accessToken);
    } else {
      blacklistSessions.set(userId, [accessToken]);
    }

    return {
      status: 200,
      message: "Logout is successful.",
    };
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Logout service error.\n`,
      err
    );
    return {
      status: 500,
      message: "Failed to logout. Please try again.",
    };
  }
}

export async function refreshAccessTokenService({
  userId,
}: RefreshAccessTokenInput): Promise<
  RefreshAccessTokenOutput | ResponseDomain | null
> {
  try {
    const existingAccount = await findAccountById({ id: userId });
    if (!existingAccount) {
      return { status: 404, message: "Account not found." };
    }

    const accessToken: string = createAccessToken(
      JSON.stringify({
        userId: existingAccount.id,
        username: existingAccount.username,
      })
    );

    return {
      userId: existingAccount.id,
      username: existingAccount.username,
      accessToken,
    };
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Refresh token service error.\n`,
      err
    );
    return null;
  }
}

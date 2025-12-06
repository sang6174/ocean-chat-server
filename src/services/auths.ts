import * as jwt from "jsonwebtoken";

import type {
  ResponseDomain,
  RegisterDomainInput,
  RegisterDomainOutput,
  LoginDomainInput,
  LoginDomainOutput,
} from "../types/domain";
import { registerRepository } from "../repository";
import { pgFindUserByEmail, pgFindAccountByUsername } from "../models";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
const accessTokenExpiresIn = (process.env.ACCESS_TOKEN_EXPIRES_IN ??
  "12h") as jwt.SignOptions["expiresIn"];

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
const refreshTokenExpiresIn = (process.env.REFRESH_TOKEN_EXPIRES_IN ??
  "5d") as jwt.SignOptions["expiresIn"];

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
    const existingUser = await pgFindUserByEmail({ email });
    if (existingUser) {
      return {
        status: 409,
        message: "Email is already in use. Please use a different email.",
      };
    }

    const existingAccount = await pgFindAccountByUsername({ username });
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
    const existingAccount = await pgFindAccountByUsername({ username });
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
        username: existingAccount.username,
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

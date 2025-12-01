import * as jwt from "jsonwebtoken";

import type { HttpResponse } from "../types";
import {
  pgFindUserByEmail,
  pgFindAccountByUsername,
  pgRegisterTransaction,
} from "../models";

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

export async function registerService(
  name: string,
  email: string,
  username: string,
  password: string
) {
  try {
    const existingUser = await pgFindUserByEmail(email);
    if (existingUser.rowCount !== 0) {
      return {
        status: 409,
        message: "Email is already in use. Please use a different email.",
      };
    }

    const existingAccount = await pgFindAccountByUsername(username);
    if (existingAccount.rowCount !== 0) {
      return {
        status: 409,
        message: "Username is already in use. Please use a different username.",
      };
    }

    const hashedPassword: string = await Bun.password.hash(password);
    const result: HttpResponse = await pgRegisterTransaction(
      name,
      email,
      username,
      hashedPassword
    );
    return result;
  } catch (err) {
    console.log("Register service error: ", err);
    return null;
  }
}

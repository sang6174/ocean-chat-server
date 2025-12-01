import * as jwt from "jsonwebtoken";

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

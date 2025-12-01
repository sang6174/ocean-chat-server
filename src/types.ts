// TokenPayload
export interface UserTokenPayload {
  data: {
    userId: string;
    username: string;
  };
  iat: number;
  exp: number;
}

export interface StringTokenPayload {
  data: string;
  iat: number;
  exp: number;
}

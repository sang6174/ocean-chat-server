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

// HTTP request/response interface
export interface HttpRegisterPost {
  name: string;
  email: string;
  username: string;
  password: string;
}

export type HttpResponse = {
  status: number;
  message: string;
};

export interface HttpLoginPost {
  username: string;
  password: string;
}

export interface HttpLoginPostResponse {
  userId: string;
  username: string;
  accessToken: string;
  refreshToken: string;
}

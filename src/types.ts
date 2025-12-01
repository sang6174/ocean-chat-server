// Conversation
export enum ConversationType {
  Group = "group",
  Direct = "direct",
  Myself = "myself",
}

export type ConversationMetadata = {
  name: string;
  creator: string;
};

export type Participant = {
  id: string;
  username: string;
};

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

export interface HttpConversationPost {
  type: ConversationType;
  metadata: ConversationMetadata;
  participants: string[];
}

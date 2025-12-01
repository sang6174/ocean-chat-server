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

export type ConversationIdentifier = {
  conversationId: string;
  type: ConversationType;
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

export interface HttpMessagePost {
  conversation: ConversationIdentifier;
  message: string;
}

export interface HttpParticipantPost {
  conversation: ConversationIdentifier;
  participantIds: string[];
}
// Services
export interface SendMessageInput {
  senderId: string;
  accessToken: string;
  conversation: ConversationIdentifier;
  message: string;
}

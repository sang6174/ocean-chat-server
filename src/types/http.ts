import type { User, Account, ConversationIdentifier } from "./domain";

export interface HttpResponse {
  status: number;
  message: string;
}

export interface HttpRegisterPost {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface HttpLoginPost {
  username: string;
  password: string;
}

export interface HttpLoginPostResponse {
  userId: string;
  username: string;
  accessToken: string;
}

export interface HttpConversationPost {
  type: string;
  metadata: {
    name: string;
  };
  participantIds: string[];
}

export interface HttpMessagePost {
  conversation: ConversationIdentifier;
  message: string;
}

export interface HttpParticipantsPost {
  conversation: ConversationIdentifier;
  participantIds: string[];
}

export interface HttpMessagesGet {
  conversationId: string;
  limit?: number;
  offset?: number;
}

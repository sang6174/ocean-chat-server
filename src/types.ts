// Conversation
export enum ConversationType {
  Group = "group",
  Direct = "direct",
  Myself = "myself",
}

export enum ConversationRoleType {
  ADMIN = "admin",
  MEMBER = "member",
}

export type ConversationMetadata = {
  name: string;
  creator: string;
};

export type Conversation = {
  id: string;
  type: ConversationMetadata;
  metadata: ConversationMetadata;
  createdAt: Date;
};

export type ConversationIdentifier = {
  conversationId: string;
  type: ConversationType;
};

export type Participant = {
  id: string;
  username: string;
};

// WebSocket
export interface DataWebSocket {
  userId: string;
  username: string;
  accessToken: string;
  conversationIdentifiers: ConversationIdentifier[];
}

export interface WsSendMessageInput {
  conversation: ConversationIdentifier;
  senderId: string;
  message: string;
}

export enum WsServerEvent {
  CONVERSATION_CREATED = "conversation.created",
  MESSAGE_CREATED = "message.created",
  CONVERSATION_ADDED_PARTICIPANTS = "conversation.added.participants",
}

export type EventCallback<T> = (payload: T) => void;

export type WsToUser = {
  senderId: string;
  toUserId: string;
};

export type WsToConversation = {
  senderId: string;
  toConversation: ConversationIdentifier;
};

export interface WsNormalOutput {
  type: string;
  payload: {
    metadata: WsToUser | WsToConversation;
    data: string | string[] | Conversation | GetConversationInput;
  };
}

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

export type HttpResponseWithData<T> = {
  status: number;
  message: string;
  data: T;
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

export interface CreateConversationInput {
  type: ConversationType;
  metadata: ConversationMetadata;
  participants: string[];
  senderId: string;
  accessToken: string;
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

export interface AddParticipantsInput {
  userId: string;
  accessToken: string;
  conversation: ConversationIdentifier;
  participantIds: string[];
}

export interface GetConversationInput {
  conversation: {
    id: string;
    type: ConversationType;
    metadata: ConversationMetadata;
  };
  participants: {
    id: string;
    role: ConversationRoleType;
    joined_at: Date;
  }[];
  messages: {
    senderId: string;
    content: string;
    createdAt: Date;
  }[];
}

export interface PublishConversationCreated {
  senderId: string;
  accessToken: string;
  recipientIds: string[];
  conversation: Conversation;
}

export interface PublishMessageCreated {
  senderId: string;
  accessToken: string;
  conversationIdentifier: ConversationIdentifier;
  recipientIds: string[];
  message: string;
}

export interface PublishParticipantAdded {
  senderId: string;
  accessToken: string;
  oldParticipants: string[];
  newParticipants: string[];
  conversationIdentifier: ConversationIdentifier;
  fullConversation: GetConversationInput;
}

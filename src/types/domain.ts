// ============================================================
//  ENUMS & VALUE OBJECTS
// ============================================================
export enum ConversationType {
  Group = "group",
  Direct = "direct",
  Myself = "myself",
}

export enum ConversationRoleType {
  ADMIN = "admin",
  MEMBER = "member",
}

export enum WsServerEvent {
  CONVERSATION_CREATED = "conversation.created",
  MESSAGE_CREATED = "message.created",
  CONVERSATION_ADDED_PARTICIPANTS = "conversation.added.participants",
  NOTIFICATION_ADD_FRIEND = "notification.add.friend",
  NOTIFICATION_ACCEPTED_FRIEND = "notification.accepted.friend",
  NOTIFICATION_DENIED_FRIEND = "notification.denied.friend",
}

export type EventCallback<T> = (payload: T) => void;

export type ConversationMetadata = {
  name: string;
  creator: {
    id: string;
    username: string;
  };
};

export interface UserTokenPayload {
  data: {
    userId: string;
    username: string;
  };
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  data: {
    userId: string;
    authToken: string;
  };
  iat: number;
  exp: number;
}

export interface StringTokenPayload {
  data: string;
  iat: number;
  exp: number;
}

export interface ResponseDomain {
  status: number;
  code: string;
  message: string;
}

// ============================================================
//  DOMAIN ENTITIES
// ============================================================
export type User = {
  id: string;
  name: string;
  email: string;
};

export type Account = {
  id: string;
  username: string;
  password: string;
};

export type AccountNoPassword = Omit<Account, "password">;

export type Conversation = {
  id: string;
  type: ConversationType;
  metadata: ConversationMetadata;
};

export type Participant = {
  userId: string;
  conversationId: string;
  role: string;
  lastSeen: Date;
  joinedAt: Date;
};

export type ParticipantNoConversationId = Omit<Participant, "conversation_id">;
export type ParticipantWithUsername = ParticipantNoConversationId & {
  username: string;
};

export type Message = {
  id: string;
  sender: {
    id: string;
    username: string;
  };
  conversationId: string;
  content: string;
};

// ============================================================
// DOMAIN INPUT / OUTPUT
// ============================================================
export interface RegisterDomainInput {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface RegisterDomainOutput {
  user: User;
  account: Account;
}

export interface LoginDomainInput {
  username: string;
  password: string;
}

export interface LoginDomainOutput {
  userId: string;
  username: string;
  authToken: string;
  refreshToken: string;
}

export interface LogoutDomainInput {
  userId: string;
  authToken: string;
  refreshToken: string;
}

export interface RefreshAuthTokenInput {
  userId: string;
}

export interface RefreshAuthTokenOutput {
  userId: string;
  username: string;
  authToken: string;
}

export interface CreateConversationDomainInput {
  type: ConversationType;
  metadata: ConversationMetadata;
  participants: {
    id: string;
    username: string;
  }[];
  authToken: string;
}

export interface SendMessageDomainInput {
  sender: {
    id: string;
    username: string;
  };
  authToken: string;
  conversationId: string;
  message: string;
}

export interface AddParticipantsDomainInput {
  authToken: string;
  creator: {
    id: string;
    username: string;
  };
  conversationId: string;
  participants: {
    id: string;
    username: string;
  }[];
}

export interface GetProfileUserDomainInput {
  userId: string;
}

export interface GetProfileUserDomainOutput extends User {
  username: string;
}

export interface GetConversationDomainInput {
  userId: string;
}

export interface GetConversationDomainOutput {
  conversation: Conversation;
  participants: ParticipantNoConversationId[];
  messages: Message[];
}

export interface GetMessagesDomainInput {
  conversationId: string;
  limit?: number;
  offset?: number;
}

export interface GetMessagesDomainOutput {
  id: string;
  sender: AccountNoPassword;
  conversationId: string;
  message: string;
}

// ============================================================
// REPOSITORY INPUT / OUTPUT
// ============================================================
export interface FindUserByEmailRepositoryInput {
  email: string;
}
export interface FindAccountByUsernameRepositoryInput {
  username: string;
}
export interface FindAccountByIdRepositoryInput {
  id: string;
}

export interface RegisterRepositoryInput {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface RegisterRepositoryOutput {
  user: User;
  account: Account;
  conversation: Conversation;
}

export interface CreateConversationRepositoryInput {
  type: ConversationType;
  metadata: ConversationMetadata;
  participants: {
    id: string;
    username: string;
  }[];
}

export interface CreateConversationRepositoryOutput {
  conversation: Conversation;
  participants: ParticipantWithUsername[];
}

export interface GetConversationIdsRepositoryInput {
  userId: string;
}

export interface GetConversationIdsRepositoryOutput {
  ids: string[];
}

export interface GetConversationRepositoryInput {
  conversationId: string;
  limit: number;
  offset: number;
}

export interface GetConversationRepositoryOutput {
  conversation: Conversation;
  participants: ParticipantWithUsername[];
  messages: Message[];
}

export interface GetParticipantRoleRepositoryInput {
  userId: string;
  conversationId: string;
}

export interface GetParticipantRoleRepositoryOutput {
  role: string;
}

export interface CreateMessageRepositoryInput {
  senderId: string;
  conversationId: string;
  content: string;
}

export interface CreateMessageRepositoryOutput {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
}

export interface CreateMessageTransactionRepositoryOutput {
  message: CreateMessageRepositoryOutput;
  participants: ParticipantWithUsername[];
}

export interface GetParticipantIdsDomainOutput {
  userId: string;
}

export interface GetMessagesRepositoryInput {
  conversationId: string;
  limit: number;
  offset: number;
}

export interface GetMessageRepositoryOutput {
  id: string;
  sender: AccountNoPassword;
  conversationId: string;
  message: string;
}

export interface AddParticipantsRepositoryInput {
  conversationId: string;
  participantIds: string[];
}

export interface GetProfileUserRepositoryInput {
  userId: string;
}

export interface GetProfileUserRepositoryOutput extends User {
  username: string;
}

export interface GetParticipantIdsRepositoryInput {
  conversationId: string;
}

export interface GetParticipantIdsRepositoryOutput {
  userId: string;
}

// ============================================================
// PUBLISHER TYPE
// ============================================================

export interface PublishConversationCreated {
  authToken: string;
  sender: {
    id: string;
    username: string;
  };
  recipients: {
    id: string;
    username: string;
  }[];
  conversation: CreateConversationRepositoryOutput;
}

export interface PublishMessageCreated {
  authToken: string;
  sender: {
    id: string;
    username: string;
  };
  recipients: {
    id: string;
    username: string;
  }[];
  conversationId: string;
  message: string;
}

export interface PublishParticipantAdded {
  sender: {
    id: string;
    username: string;
  };
  authToken: string;
  oldParticipants: ParticipantWithUsername[];
  newParticipants: ParticipantWithUsername[];
  conversationId: string;
  conversation: GetConversationRepositoryOutput;
}

export interface PublishNotificationAddFriend {
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
}

export interface PublishNotificationAcceptedFriend<T> {
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
  data: T;
}

export interface PublishNotificationDeniedFriend {
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
}

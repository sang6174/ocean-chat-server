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
  creator: string;
};

export type ConversationIdentifier = {
  id: string;
  type: ConversationType;
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
    accessToken: string;
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
  accessToken: string;
  refreshToken: string;
}

export interface RefreshAccessTokenInput {
  userId: string;
}

export interface RefreshAccessTokenOutput {
  userId: string;
  username: string;
  accessToken: string;
}

export interface CreateConversationDomainInput {
  type: ConversationType;
  metadata: ConversationMetadata;
  participantIds: string[];
  senderId: string;
  accessToken: string;
}

export interface SendMessageDomainInput {
  senderId: string;
  accessToken: string;
  conversation: ConversationIdentifier;
  message: string;
}

export interface AddParticipantsDomainInput {
  userId: string;
  accessToken: string;
  conversation: ConversationIdentifier;
  participantIds: string[];
}

export interface GetInfoUserDomainInput {
  userId: string;
}

export interface GetInfoUserDomainOutput extends User {
  username: string;
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
}

export interface CreateConversationRepositoryInput {
  type: ConversationType;
  metadata: ConversationMetadata;
  participantIds: string[];
}

export interface CreateConversationRepositoryOutput {
  conversation: Conversation;
  participants: Participant[];
}

export interface GetConversationRepositoryInput {
  conversationId: string;
  limit?: number;
  offset?: number;
}

export interface GetConversationRepositoryOutput {
  conversation: Conversation;
  participants: ParticipantNoConversationId[];
  messages: Message[];
}

export interface GetConversationIdentifiersRepositoryInput {
  userId: string;
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

export interface GetInfoUserRepositoryInput {
  userId: string;
}

export interface GetInfoUserRepositoryOutput extends User {
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
  senderId: string;
  accessToken: string;
  recipientIds: string[];
  conversation: CreateConversationRepositoryOutput;
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
  conversation: GetConversationRepositoryOutput;
}

export interface PublishNotificationAddFriend {
  senderId: string;
  senderUsername: string;
  recipientId: string;
}

export interface PublishNotificationAddedFriend<T> {
  senderId: string;
  recipientId: string;
  data: T;
}

export interface PublishNotificationDeniedFriend {
  senderId: string;
  senderUsername: string;
  recipientId: string;
}

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

export enum NotificationType {
  FRIEND_REQUEST = "friend_request",
  ACCEPTED_FRIEND_REQUEST = "accept_friend_request",
  DENIED_FRIEND_REQUEST = "denied_friend_request",
}

export enum NotificationStatusType {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum WsServerEvent {
  CONVERSATION_CREATED = "conversation.created",
  MESSAGE_CREATED = "message.created",
  CONVERSATION_ADDED_PARTICIPANTS = "conversation.added.participants",
  NOTIFICATION_FRIEND_REQUEST = "notification.friend.request",
  NOTIFICATION_CANCELLED_FRIEND_REQUEST = "notification.cancelled.friend.request",
  NOTIFICATION_ACCEPTED_FRIEND_REQUEST = "notification.accepted.friend.request",
  NOTIFICATION_DENIED_FRIEND_REQUEST = "notification.denied.friend.request",
}

export type EventCallback<T> = (payload: T) => void;

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
  userId: string;
};

export type Conversation = {
  id: string;
  type: ConversationType;
  name: string;
  lastEvent: Date;
  creator: {
    id: string;
    username: string;
  };
};

export type Participant = {
  user: {
    id: string;
    username: string;
  };
  role: string;
  lastSeen: Date;
  joinedAt: Date;
};

export type Message = {
  id: string;
  content: string;
  senderId: string | null;
  conversationId: string;
};

export type Notification = {
  id: string;
  type: NotificationType;
  status: NotificationStatusType;
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
};

// ============================================================
// DOMAIN & REPOSITORY INPUT / OUTPUT
// ============================================================
// Auth Service
export interface RegisterDomainInput {
  name: string;
  email: string;
  username: string;
  password: string;
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
  participant: Participant;
  messages: Omit<Message, "conversationId">[];
}

export interface RegisterDomainOutput {
  user: User;
  account: Account;
}

export interface LoginDomainInput {
  username: string;
  password: string;
}

export interface GenerateAccessTokenInput {
  userId: string;
}

export interface GenerateAccessTokenOutput {
  userId: string;
  username: string;
  accessToken: string;
}

export interface LoginDomainOutput {
  userId: string;
  username: string;
  accessToken: string;
  refreshToken: string;
}

export interface LogoutDomainInput {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

// Profile Service
export interface GetProfileUserDomainInput {
  userId: string;
}

export interface GetProfileUserRepositoryInput {
  userId: string;
}

export interface GetProfileUserRepositoryOutput extends User {
  username: string;
}

export interface GetProfileUserDomainOutput extends User {
  username: string;
}

// Conversation Service
export interface CreateGroupConversationDomainInput {
  type: ConversationType;
  name: string;
  creator: {
    id: string;
    username: string;
  };
  participantIds: string[];
}

export interface CreateConversationRepositoryInput {
  type: ConversationType;
  name: string;
  creator: {
    id: string;
    username: string;
  };
  participantIds: string[];
}

export interface CreateConversationRepositoryOutput {
  conversation: Conversation;
  participants: Participant[];
  messages: Omit<Message, "conversationId">[];
}

export interface SendMessageDomainInput {
  conversationId: string;
  sender: {
    id: string;
    username: string;
  };
  message: string;
}

export interface CreateMessageRepositoryInput {
  senderId: string;
  conversationId: string;
  content: string;
}

export interface CreateMessageRepositoryOutput {
  message: Message;
  participants: Participant[];
}

export interface AddParticipantsDomainInput {
  creator: {
    id: string;
    username: string;
  };
  conversationId: string;
  participantIds: string[];
}

export interface GetParticipantRoleRepositoryInput {
  userId: string;
  conversationId: string;
}

export interface GetParticipantRoleRepositoryOutput {
  role: string;
}

export interface GetParticipantIdsDomainOutput {
  userId: string;
}

export interface AddParticipantsRepositoryInput {
  conversationId: string;
  creator: {
    id: string;
    username: string;
  };
  participantIds: string[];
}

export interface FindUserByEmailRepositoryInput {
  email: string;
}

export interface FindAccountByUsernameRepositoryInput {
  username: string;
}

export interface FindAccountByIdRepositoryInput {
  id: string;
}

export interface GetParticipantsByConversationIdRepositoryInput {
  conversationId: string;
}

export interface GetParticipantIdsByConversationIdRepositoryInput {
  conversationId: string;
}

export interface AddParticipantsRepositoryOutput {
  participants: Participant[];
  messages: Message[];
}

export interface GetConversationsByUserIdDomainInput {
  userId: string;
}

export interface GetConversationIdsRepositoryInput {
  userId: string;
}

export interface GetConversationIdsRepositoryOutput {
  ids: string[];
}

export interface GetConversationByIdRepositoryInput {
  conversationId: string;
  limit: number;
  offset: number;
}

export interface GetConversationByIdRepositoryOutput {
  conversation: Conversation;
  participants: Participant[];
  messages: Omit<Message, "conversationId">[];
}

export interface GetConversationsByUserIdDomainOutput {
  conversation: Conversation;
  participants: Participant[];
  messages: Omit<Message, "conversationId">[];
}

export interface GetMessagesByConversationIdDomainInput {
  conversationId: string;
  limit?: number;
  offset?: number;
}

export interface GetMessagesRepositoryInput {
  conversationId: string;
  limit: number;
  offset: number;
}

export interface GetMessageRepositoryOutput {
  id: string;
  sender: {
    id: string;
    username: string;
  };
  conversationId: string;
  message: string;
  isDeleted: boolean;
}

export interface GetMessagesByConversationIdDomainOutput {
  id: string;
  sender: {
    id: string;
    username: string;
  };
  conversationId: string;
  message: string;
}

// Notification Service
export interface FriendRequestDomainInput {
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
}

export interface FriendRequestWithNotificationIdDomainInput {
  notificationId: string;
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
}

export interface SendFriendRequestRepositoryInput {
  type: NotificationType;
  status: NotificationStatusType;
  content: string;
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
}

export interface SendFriendRequestRepositoryOutput {
  id: string;
  type: NotificationType;
  status: NotificationStatusType;
  content: string;
  senderId: string;
  recipientId: string;
}

export interface GetNotificationRepositoryInput {
  userId: string;
}

export interface GetNotificationRepositoryOutput {
  id: string;
  type: NotificationType;
  status: NotificationStatusType;
  content: string;
  senderId: string;
  recipientId: string;
}

export interface CancelFriendRequestRepositoryInput {
  id: string;
  status: NotificationStatusType;
}

export interface CancelFriendRequestRepositoryOutput {
  id: string;
  type: NotificationType;
  status: NotificationStatusType;
  content: string;
  senderId: string;
  recipientId: string;
}

export interface AcceptFriendRequestRepositoryInput {
  FriendRequest: {
    id: string;
    status: NotificationStatusType;
  };
  AcceptedFriendRequest: {
    type: NotificationType;
    status: NotificationStatusType;
    content: string;
    sender: {
      id: string;
      username: string;
    };
    recipient: {
      id: string;
      username: string;
    };
  };
}

export interface AcceptFriendRequestRepositoryOutput {
  conversation: Omit<Conversation, "creator">;
  participants: Participant[];
  messages: Omit<Message, "conversationId">[];
  notification: {
    id: string;
    type: NotificationType;
    status: NotificationStatusType;
    content: string;
    senderId: string;
    recipientId: string;
  };
}

export interface DenyFriendRequestRepositoryInput {
  FriendRequest: {
    id: string;
    status: NotificationStatusType;
  };
  RejectedFriendRequest: {
    type: NotificationType;
    status: NotificationStatusType;
    content: string;
    sender: {
      id: string;
      username: string;
    };
    recipient: {
      id: string;
      username: string;
    };
  };
}

export interface DenyFriendRequestRepositoryOutput {
  id: string;
  type: NotificationType;
  status: NotificationStatusType;
  content: string;
  senderId: string;
  recipientId: string;
}

// ============================================================
// PUBLISHER TYPE
// ============================================================
export interface PublishConversationCreated {
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
  sender: {
    id: string;
    username: string;
  };
  recipients: {
    id: string;
    username: string;
  }[];
  message: Message;
}

export interface PublishParticipantAdded {
  sender: {
    id: string;
    username: string;
  };
  oldParticipants: Participant[];
  newParticipants: Participant[];
  conversation: GetConversationByIdRepositoryOutput;
}

export interface PublishNotificationFriendRequest<T> {
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

export interface PublishNotificationAcceptedFriendRequest<T> {
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

export interface PublishNotificationDeniedFriendRequest<T> {
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

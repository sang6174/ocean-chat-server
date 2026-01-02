import type {
  Account,
  FindAccountByUsernameRepositoryInput,
  FindAccountByUserIdRepositoryInput,
  GetConversationByIdRepositoryInput,
  GetConversationByIdRepositoryOutput,
  GetProfileUserRepositoryInput,
  GetProfileUserRepositoryOutput,
  GetMessagesRepositoryInput,
  GetMessageRepositoryOutput,
  GetParticipantRoleRepositoryInput,
  GetParticipantRoleRepositoryOutput,
  GetParticipantIdsByConversationIdRepositoryInput,
  ConversationType,
  GetConversationIdsRepositoryInput,
  GetConversationIdsRepositoryOutput,
  SendFriendRequestRepositoryInput,
  SendFriendRequestRepositoryOutput,
  CancelFriendRequestRepositoryInput,
  CancelFriendRequestRepositoryOutput,
  NotificationType,
  NotificationStatusType,
  GetNotificationRepositoryInput,
  GetNotificationRepositoryOutput,
  GetParticipantsByConversationIdRepositoryInput,
  Participant,
} from "../types/domain";
import {
  pgFindAccountByUsername,
  pgFindAccountByUserId,
  pgGetConversationById,
  pgGetMessages,
  pgGetParticipantRole,
  pgGetParticipantIds,
  pgGetAllProfileUsers,
  pgGetProfileUser,
  pgGetConversationIds,
  pgGetParticipantByConversationId,
  pgCreateFriendRequestNotification,
  pgCancelFriendRequestNotification,
  pgGetNotifications,
  pgGetNotificationById,
} from "../models";

export async function findAccountByUsername(
  input: FindAccountByUsernameRepositoryInput
): Promise<Account | null> {
  const result = await pgFindAccountByUsername(input);
  if (!result) {
    return null;
  }

  return {
    id: result.id,
    username: result.username,
    password: result.password,
    userId: result.user_id,
  };
}

export async function findAccountByUserId(
  input: FindAccountByUserIdRepositoryInput
): Promise<Account | null> {
  const result = await pgFindAccountByUserId(input);
  if (!result) {
    return null;
  }

  return {
    id: result.id,
    username: result.username,
    password: result.password,
    userId: result.user_id,
  };
}

export async function getAllProfileUsersRepository(): Promise<
  GetProfileUserRepositoryOutput[] | null
> {
  const result = await pgGetAllProfileUsers();

  if (!result) {
    return null;
  }

  return result.map((user) => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
    };
  });
}

export async function getProfileUserRepository(
  input: GetProfileUserRepositoryInput
): Promise<GetProfileUserRepositoryOutput | null> {
  const result = await pgGetProfileUser(input);

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    name: result.name,
    email: result.email,
    username: result.username,
  };
}

export async function createFriendRequestRepository(
  input: SendFriendRequestRepositoryInput
): Promise<SendFriendRequestRepositoryOutput> {
  const result = await pgCreateFriendRequestNotification(input);

  return {
    id: result.id,
    type: result.type as NotificationType.FRIEND_REQUEST,
    status: result.status as NotificationStatusType.PENDING,
    content: result.content,
    senderId: result.sender_id,
    recipientId: result.recipient_id,
  };
}

export async function getConversationIdsRepository(
  input: GetConversationIdsRepositoryInput
): Promise<GetConversationIdsRepositoryOutput | null> {
  const result = await pgGetConversationIds(input);

  if (!result) {
    return null;
  }

  const ids = result.map((obj) => obj.id);
  return { ids };
}

export async function getConversationByIdRepository(
  input: GetConversationByIdRepositoryInput
): Promise<GetConversationByIdRepositoryOutput> {
  const result = await pgGetConversationById(input);

  const creatorUsername = result.participants.find(
    (p) => p.user_id === result.conversation.creator_id
  )?.username;

  return {
    conversation: {
      id: result.conversation.id,
      type: result.conversation.type as ConversationType,
      name: result.conversation.name,
      lastEvent: result.conversation.last_event,
      creator: {
        id: result.conversation.creator_id,
        username: creatorUsername ?? "",
      },
    },
    participants: result.participants.map((participant) => {
      return {
        user: {
          id: participant.user_id,
          username: participant.username,
        },
        role: participant.role,
        lastSeen: participant.last_seen,
        joinedAt: participant.joined_at,
      };
    }),
    messages: result.messages.map((message) => {
      return {
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
      };
    }),
  };
}

export async function getMessagesRepository(
  input: GetMessagesRepositoryInput
): Promise<GetMessageRepositoryOutput[]> {
  const result = await pgGetMessages(input);

  return result.map((message) => {
    return {
      id: message.id,
      sender: {
        id: message.sender_id,
        username: message.sender_username,
      },
      conversationId: message.conversation_id,
      message: message.content,
      isDeleted: message.is_deleted,
    };
  });
}

export async function getParticipantRoleRepository(
  input: GetParticipantRoleRepositoryInput
): Promise<GetParticipantRoleRepositoryOutput | null> {
  const result = await pgGetParticipantRole(input);

  if (!result) {
    return null;
  }

  return result;
}

export async function getParticipantsByConversationIdRepository(
  input: GetParticipantsByConversationIdRepositoryInput
): Promise<Participant[] | null> {
  const pgResult = await pgGetParticipantByConversationId(input);

  if (!pgResult) {
    return null;
  }

  const result = pgResult.map((p) => {
    return {
      user: {
        id: p.user_id,
        username: p.username,
      },
      role: p.role,
      joinedAt: p.joined_at,
      lastSeen: p.last_seen,
    };
  });

  return result;
}

export async function getParticipantIdsRepository(
  input: GetParticipantIdsByConversationIdRepositoryInput
): Promise<string[] | null> {
  const result = await pgGetParticipantIds(input);

  if (!result) {
    return null;
  }

  return result.map((obj) => {
    return obj.user_id;
  });
}

export async function getNotificationsRepository(
  input: GetNotificationRepositoryInput
): Promise<GetNotificationRepositoryOutput[]> {
  const result = await pgGetNotifications(input);

  return result.map((notification) => {
    return {
      id: notification.id,
      type: notification.type as NotificationType,
      status: notification.status as NotificationStatusType,
      content: notification.content,
      senderId: notification.sender_id,
      recipientId: notification.recipient_id,
    };
  });
}

export async function getNotificationByIdRepository(
  id: string
): Promise<GetNotificationRepositoryOutput | null> {
  const result = await pgGetNotificationById(id);

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    type: result.type as NotificationType,
    status: result.status as NotificationStatusType,
    content: result.content,
    senderId: result.sender_id,
    recipientId: result.recipient_id,
  };
}

export async function cancelFriendRequestRepository(
  input: CancelFriendRequestRepositoryInput
): Promise<CancelFriendRequestRepositoryOutput> {
  const result = await pgCancelFriendRequestNotification(input);

  return {
    id: result.id,
    type: result.type as NotificationType,
    status: result.status as NotificationStatusType,
    content: result.content,
    senderId: result.sender_id,
    recipientId: result.recipient_id,
  };
}

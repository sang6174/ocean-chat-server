import type {
  ConversationType,
  RegisterRepositoryInput,
  RegisterRepositoryOutput,
  CreateConversationRepositoryInput,
  CreateConversationRepositoryOutput,
  AddParticipantsRepositoryInput,
  AddParticipantsRepositoryOutput,
  CreateMessageRepositoryInput,
  CreateMessageRepositoryOutput,
  AcceptFriendRequestRepositoryInput,
  AcceptFriendRequestRepositoryOutput,
  DenyFriendRequestRepositoryInput,
  DenyFriendRequestRepositoryOutput,
  NotificationType,
  NotificationStatusType,
} from "../types/domain";
import {
  pgRegisterTransaction,
  pgCreateConversationTransaction,
  pgAddParticipantsTransaction,
  pgCreateMessageTransaction,
  pgAcceptFriendRequestTransaction,
  pgDenyFriendRequestTransaction,
} from "../models";

export async function registerRepository(
  input: RegisterRepositoryInput
): Promise<RegisterRepositoryOutput> {
  const resultRegister = await pgRegisterTransaction(input);

  return {
    user: {
      id: resultRegister.user.id,
      name: resultRegister.user.name,
      email: resultRegister.user.email,
    },
    account: {
      id: resultRegister.account.id,
      username: resultRegister.account.username,
      password: resultRegister.account.password,
      userId: resultRegister.account.user_id,
    },
    conversation: {
      id: resultRegister.conversation.id,
      type: resultRegister.conversation.type as ConversationType,
      name: resultRegister.conversation.name,
      lastEvent: resultRegister.conversation.last_event,
      creator: {
        id: resultRegister.conversation.creator_id,
        username: resultRegister.account.username,
      },
    },
    participant: {
      user: {
        id: resultRegister.participant.user_id,
        username: resultRegister.account.username,
      },
      role: resultRegister.participant.role,
      lastSeen: resultRegister.participant.last_seen,
      joinedAt: resultRegister.participant.joined_at,
    },
    messages: resultRegister.messages.map((message) => {
      return {
        id: message.id,
        senderId: message.sender_id,
        content: message.content,
      };
    }),
  };
}

export async function createConversationRepository(
  input: CreateConversationRepositoryInput
): Promise<CreateConversationRepositoryOutput> {
  const result = await pgCreateConversationTransaction(input);

  return {
    conversation: {
      id: result.conversation.id,
      type: result.conversation.type as ConversationType,
      name: result.conversation.name,
      lastEvent: result.conversation.last_event,
      creator: {
        id: result.conversation.creator_id,
        username: input.creator.username,
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

export async function addParticipantsRepository(
  input: AddParticipantsRepositoryInput
): Promise<AddParticipantsRepositoryOutput> {
  const result = await pgAddParticipantsTransaction(input);

  const participants = result.participants.map((participant) => {
    return {
      user: {
        id: participant.user_id,
        username: participant.username,
      },
      role: participant.role,
      lastSeen: participant.last_seen,
      joinedAt: participant.joined_at,
    };
  });

  const messages = result.messages.map((msg) => {
    return {
      id: msg.id,
      content: msg.content,
      senderId: msg.sender_id,
      conversationId: msg.conversation_id,
    };
  });

  return {
    participants,
    messages,
  };
}

export async function createMessageRepository(
  input: CreateMessageRepositoryInput
): Promise<CreateMessageRepositoryOutput> {
  const result = await pgCreateMessageTransaction(input);

  const participants = result.participants.map((p) => {
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

  return {
    message: {
      id: result.message.id,
      conversationId: result.message.conversation_id,
      senderId: result.message.sender_id,
      content: result.message.content,
    },
    participants,
  };
}

export async function acceptFriendRequestRepository(
  input: AcceptFriendRequestRepositoryInput
): Promise<AcceptFriendRequestRepositoryOutput> {
  const result = await pgAcceptFriendRequestTransaction(input);

  return {
    conversation: {
      id: result.conversation.id,
      type: result.conversation.type as ConversationType,
      name: result.conversation.name,
      lastEvent: result.conversation.last_event,
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
        senderId: message.sender_id,
        content: message.content,
      };
    }),
    notification: {
      id: result.notification.id,
      type: result.notification
        .type as NotificationType.ACCEPTED_FRIEND_REQUEST,
      status: result.notification.status as NotificationStatusType.ACCEPTED,
      content: result.notification.content,
      senderId: result.notification.sender_id,
      recipientId: result.notification.recipient_id,
    },
  };
}

export async function denyFriendRequestRepository(
  input: DenyFriendRequestRepositoryInput
): Promise<DenyFriendRequestRepositoryOutput> {
  const result = await pgDenyFriendRequestTransaction(input);

  return {
    id: result.id,
    type: result.type as NotificationType.DENIED_FRIEND_REQUEST,
    status: result.status as NotificationStatusType.REJECTED,
    content: result.content,
    senderId: result.sender_id,
    recipientId: result.recipient_id,
  };
}

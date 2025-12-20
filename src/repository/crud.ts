import type {
  Account,
  CreateMessageRepositoryInput,
  CreateMessageRepositoryOutput,
  FindAccountByUsernameRepositoryInput,
  FindAccountByIdRepositoryInput,
  ParticipantWithUsername,
  GetConversationRepositoryInput,
  GetConversationRepositoryOutput,
  GetProfileUserRepositoryInput,
  GetProfileUserRepositoryOutput,
  GetMessagesRepositoryInput,
  GetMessageRepositoryOutput,
  GetParticipantRoleRepositoryInput,
  GetParticipantRoleRepositoryOutput,
  GetParticipantIdsRepositoryInput,
  GetParticipantIdsRepositoryOutput,
  ConversationType,
  ConversationMetadata,
  GetConversationIdsRepositoryInput,
  GetConversationIdsRepositoryOutput,
} from "../types/domain";
import {
  pgFindAccountByUsername,
  pgFindAccountById,
  pgGetConversation,
  pgCreateMessage,
  pgGetMessages,
  pgGetParticipantRole,
  pgGetParticipantIds,
  pgGetAllProfileUsers,
  pgGetProfileUser,
  pgGetConversationIds,
} from "../models";

// ============================================================
// CREATE
// ============================================================
export async function createMessageRepository(
  input: CreateMessageRepositoryInput
): Promise<CreateMessageRepositoryOutput> {
  const result = await pgCreateMessage(input);
  return {
    id: result.id,
    senderId: result.sender_id,
    conversationId: result.conversation_id,
    content: result.content,
  };
}

// ============================================================
// READ
// ============================================================
export async function findAccountByUsername(
  input: FindAccountByUsernameRepositoryInput
): Promise<Account | null> {
  return (await pgFindAccountByUsername(input)) ?? null;
}

export async function findAccountById(
  input: FindAccountByIdRepositoryInput
): Promise<Account | null> {
  return (await pgFindAccountById(input)) ?? null;
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

export async function getConversationRepository(
  input: GetConversationRepositoryInput
): Promise<GetConversationRepositoryOutput | null> {
  const result = await pgGetConversation(input);
  if (!result) {
    return null;
  }

  return {
    conversation: {
      id: result.conversation.id,
      type: result.conversation.type as ConversationType,
      metadata: result.conversation.metadata as ConversationMetadata,
    },

    participants: result.participants.map((participant) => {
      return {
        userId: participant.user_id,
        username: participant.username,
        role: participant.role,
        lastSeen: participant.last_seen,
        joinedAt: participant.joined_at,
      } as ParticipantWithUsername;
    }),

    messages: result.messages.map((message) => {
      return {
        id: message.id,
        sender: {
          id: message.sender_id,
          username: message.sender_username,
        },
        conversationId: result.conversation.id,
        content: message.content,
      };
    }),
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
      conversationId: message.id,
      message: message.content,
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

export async function getParticipantIdsRepository(
  input: GetParticipantIdsRepositoryInput
): Promise<GetParticipantIdsRepositoryOutput[] | null> {
  const result = await pgGetParticipantIds(input);

  if (!result) {
    return null;
  }

  return result.map((obj) => {
    return {
      userId: obj.user_id,
    };
  });
}

// ============================================================
// UPDATE
// ============================================================

// ============================================================
// DELETE
// ============================================================

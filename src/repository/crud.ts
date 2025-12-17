import type {
  User,
  Account,
  CreateMessageRepositoryInput,
  CreateMessageRepositoryOutput,
  FindUserByEmailRepositoryInput,
  FindAccountByUsernameRepositoryInput,
  FindAccountByIdRepositoryInput,
  GetInfoUserRepositoryInput,
  GetInfoUserRepositoryOutput,
  GetConversationIdentifiersRepositoryInput,
  ConversationIdentifier,
  GetMessagesRepositoryInput,
  GetMessageRepositoryOutput,
  GetParticipantRoleRepositoryInput,
  GetParticipantRoleRepositoryOutput,
  GetParticipantIdsRepositoryInput,
  GetParticipantIdsRepositoryOutput,
} from "../types/domain";
import {
  pgFindUserByEmail,
  pgFindAccountByUsername,
  pgFindAccountById,
  pgGetConversationIdentifiers,
  pgCreateMessage,
  pgGetMessages,
  pgGetParticipantRole,
  pgGetParticipantIds,
  pgGetAllProfileUsers,
  pgGetProfileUser,
} from "../models";
import type { BaseLogger } from "../helpers/logger";

// ============================================================
// CREATE
// ============================================================
export async function createMessageRepository(
  baseLogger: BaseLogger,
  input: CreateMessageRepositoryInput
): Promise<CreateMessageRepositoryOutput | null> {
  const result = await pgCreateMessage(baseLogger, input);
  if (!result) {
    return null;
  }
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
export async function findUserByEmail(
  baseLogger: BaseLogger,
  input: FindUserByEmailRepositoryInput
): Promise<User | null> {
  return await pgFindUserByEmail(baseLogger, input);
}

export async function findAccountByUsername(
  baseLogger: BaseLogger,
  input: FindAccountByUsernameRepositoryInput
): Promise<Account | null> {
  return await pgFindAccountByUsername(baseLogger, input);
}

export async function findAccountById(
  baseLogger: BaseLogger,
  input: FindAccountByIdRepositoryInput
): Promise<Account | null> {
  return await pgFindAccountById(baseLogger, input);
}

export async function getConversationIdentifiersRepository(
  baseLogger: BaseLogger,
  input: GetConversationIdentifiersRepositoryInput
): Promise<ConversationIdentifier[] | null> {
  try {
    const result = await pgGetConversationIdentifiers(baseLogger, input);
    if (!result) {
      return null;
    }
    return result as ConversationIdentifier[];
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Get conversation identifiers service error.\n`,
      err
    );
    return null;
  }
}

export async function getAllProfileUsersRepository(
  baseLogger: BaseLogger
): Promise<GetInfoUserRepositoryOutput[] | null> {
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
  baseLogger: BaseLogger,
  input: GetInfoUserRepositoryInput
): Promise<GetInfoUserRepositoryOutput | null> {
  const result = await pgGetProfileUser(baseLogger, input);
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
  baseLogger: BaseLogger,
  input: GetMessagesRepositoryInput
): Promise<GetMessageRepositoryOutput[] | null> {
  const result = await pgGetMessages(baseLogger, input);
  if (!result) {
    return null;
  }

  return result.map((message) => {
    return {
      id: message.id,
      sender: {
        id: message.sender_id,
        username: message.sender_username,
      },
      conversationId: message.conversation_id,
      message: message.content,
    };
  });
}

export async function getParticipantRoleRepository(
  baseLogger: BaseLogger,
  input: GetParticipantRoleRepositoryInput
): Promise<GetParticipantRoleRepositoryOutput | null> {
  const result = await pgGetParticipantRole(baseLogger, input);
  if (!result) {
    return null;
  }
  return result;
}

export async function getParticipantIdsRepository(
  baseLogger: BaseLogger,
  input: GetParticipantIdsRepositoryInput
): Promise<GetParticipantIdsRepositoryOutput[] | null> {
  const pgResult = await pgGetParticipantIds(baseLogger, input);
  if (!pgResult) {
    return null;
  }
  const result = pgResult.map((obj) => {
    return {
      userId: obj.user_id,
    };
  });
  return result;
}

// ============================================================
// UPDATE
// ============================================================

// ============================================================
// DELETE
// ============================================================

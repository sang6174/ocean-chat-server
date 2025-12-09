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
  pgGetInfoUsers,
  pgGetInfoUser,
} from "../models";

// ============================================================
// CREATE
// ============================================================
export async function createMessageRepository({
  conversationId,
  senderId,
  content,
}: CreateMessageRepositoryInput): Promise<CreateMessageRepositoryOutput | null> {
  const result = await pgCreateMessage({
    conversationId,
    senderId,
    content,
  });
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
export async function findUserByEmail({
  email,
}: FindUserByEmailRepositoryInput): Promise<User | null> {
  return await pgFindUserByEmail({ email });
}
export async function findAccountByUsername({
  username,
}: FindAccountByUsernameRepositoryInput): Promise<Account | null> {
  return await pgFindAccountByUsername({ username });
}
export async function findAccountById({
  id,
}: FindAccountByIdRepositoryInput): Promise<Account | null> {
  return await pgFindAccountById({ id });
}

export async function getConversationIdentifiersRepository({
  userId,
}: GetConversationIdentifiersRepositoryInput): Promise<
  ConversationIdentifier[] | null
> {
  try {
    const result = await pgGetConversationIdentifiers({ userId });
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

export async function getInfoUsersRepository(): Promise<
  GetInfoUserRepositoryOutput[] | null
> {
  const result = await pgGetInfoUsers();
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

export async function getInfoUserRepository({
  userId,
}: GetInfoUserRepositoryInput): Promise<GetInfoUserRepositoryOutput | null> {
  const result = await pgGetInfoUser({ userId });
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

export async function getMessagesRepository({
  conversationId,
  limit,
  offset,
}: GetMessagesRepositoryInput): Promise<GetMessageRepositoryOutput[] | null> {
  const result = await pgGetMessages({ conversationId, limit, offset });
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

export async function getParticipantRoleRepository({
  userId,
  conversationId,
}: GetParticipantRoleRepositoryInput): Promise<GetParticipantRoleRepositoryOutput | null> {
  const result = await pgGetParticipantRole({ userId, conversationId });
  if (!result) {
    return null;
  }
  return result;
}

export async function getParticipantIdsRepository({
  conversationId,
}: GetParticipantIdsRepositoryInput): Promise<
  GetParticipantIdsRepositoryOutput[] | null
> {
  const pgResult = await pgGetParticipantIds({ conversationId });
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

import type {
  Participant,
  ConversationType,
  ConversationMetadata,
  ConversationIdentifier,
  ParticipantNoConversationId,
  RegisterDomainInput,
  RegisterDomainOutput,
  CreateConversationRepositoryInput,
  CreateConversationRepositoryOutput,
  GetConversationRepositoryInput,
  GetConversationRepositoryOutput,
  CreateMessageRepositoryInput,
  CreateMessageRepositoryOutput,
  GetMessagesRepositoryInput,
  GetMessageRepositoryOutput,
  GetParticipantRoleRepositoryInput,
  GetParticipantIdsDomainOutput,
  GetParticipantRoleRepositoryOutput,
  AddParticipantsRepositoryInput,
  GetInfoUserDomainOutput,
} from "../types/domain";
import {
  pgRegisterTransaction,
  pgCreateConversationTransaction,
  pgGetConversationTransaction,
  pgGetConversationIdentifiers,
  pgCreateMessage,
  pgGetMessages,
  pgGetParticipantRole,
  pgAddParticipantsTransaction,
  pgGetParticipantIds,
  pgGetInfoUsers,
  pgGetInfoUser,
} from "../models";
import type { PgGetInfoUserInput } from "../types/models";

export async function registerRepository({
  name,
  email,
  username,
  password,
}: RegisterDomainInput): Promise<RegisterDomainOutput> {
  const resultRegister = await pgRegisterTransaction({
    name,
    email,
    username,
    password,
  });
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
    },
  };
}

export async function createConversationRepository({
  type,
  metadata,
  participantIds,
}: CreateConversationRepositoryInput): Promise<CreateConversationRepositoryOutput | null> {
  try {
    const result = await pgCreateConversationTransaction({
      type,
      metadata,
      participantIds,
    });
    return {
      conversation: {
        id: result.conversation.id,
        type: result.conversation.type as ConversationType,
        metadata: result.conversation.metadata as ConversationMetadata,
      },
      participants: result.participants.map((participant) => {
        return {
          userId: participant.user_id,
          conversationId: participant.conversation_id,
          role: participant.role,
          lastSeen: participant.last_seen,
          joinedAt: participant.joined_at,
        };
      }),
    };
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Save conversation, participants in database error.\n`,
      err
    );
    return null;
  }
}

export async function getConversationRepository({
  conversationId,
  limit = 10,
  offset = 0,
}: GetConversationRepositoryInput): Promise<GetConversationRepositoryOutput | null> {
  try {
    const result = await pgGetConversationTransaction({
      conversationId,
      limit,
      offset,
    });
    return {
      conversation: {
        id: result.conversation.id,
        type: result.conversation.type as ConversationType,
        metadata: result.conversation.metadata as ConversationMetadata,
      },
      participants: result.participants.map((participant) => {
        return {
          userId: participant.user_id,
          role: participant.role,
          lastSeen: participant.last_seen,
          joinedAt: participant.joined_at,
        } as ParticipantNoConversationId;
      }),
      messages: result.messages.map((message) => {
        return {
          id: message.id,
          sender: {
            id: message.sender_id,
            username: message.sender_username,
          },
          conversationId: message.conversation_id,
          content: message.content,
        };
      }),
    };
  } catch (err) {
    return null;
  }
}

export async function getConversationIdentifiersRepository(
  userId: string
): Promise<ConversationIdentifier[] | null> {
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

export async function getInfoUsersRepository(): Promise<
  GetInfoUserDomainOutput[] | null
> {
  const result = await pgGetInfoUsers();
  if (!result) {
    return null;
  }
  return result;
}

export async function getInfoUserRepository({
  userId,
}: PgGetInfoUserInput): Promise<GetInfoUserDomainOutput | null> {
  const result = await pgGetInfoUser({ userId });
  if (!result) {
    return null;
  }
  return result;
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

export async function getParticipantRole({
  userId,
  conversationId,
}: GetParticipantRoleRepositoryInput): Promise<GetParticipantRoleRepositoryOutput | null> {
  const result = await pgGetParticipantRole({ userId, conversationId });
  if (!result) {
    return null;
  }
  return result;
}

export async function addParticipants({
  conversationId,
  participantIds,
}: AddParticipantsRepositoryInput): Promise<Participant[] | null> {
  try {
    const result = await pgAddParticipantsTransaction({
      conversationId,
      participantIds,
    });
    return result.map((participant) => {
      return {
        userId: participant.user_id,
        conversationId: participant.conversation_id,
        role: participant.role,
        lastSeen: participant.last_seen,
        joinedAt: participant.joined_at,
      };
    });
  } catch (err) {
    console.log(
      `[REPOSITORY_ERROR] - ${new Date().toISOString()} - Add participants with transaction error.\n`,
      err
    );
    return null;
  }
}

export async function getParticipantIds(
  conversationId: string
): Promise<GetParticipantIdsDomainOutput[] | null> {
  const pgResult = await pgGetParticipantIds(conversationId);
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

import type {
  Participant,
  ConversationType,
  ConversationMetadata,
  ParticipantNoConversationId,
  RegisterRepositoryInput,
  RegisterRepositoryOutput,
  CreateConversationRepositoryInput,
  CreateConversationRepositoryOutput,
  GetConversationRepositoryInput,
  GetConversationRepositoryOutput,
  AddParticipantsRepositoryInput,
} from "../types/domain";
import {
  pgRegisterTransaction,
  pgCreateConversationTransaction,
  pgGetConversationTransaction,
  pgAddParticipantsTransaction,
} from "../models";

export async function registerRepository({
  name,
  email,
  username,
  password,
}: RegisterRepositoryInput): Promise<RegisterRepositoryOutput> {
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

export async function addParticipantsRepository({
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

import type {
  Participant,
  ConversationType,
  ConversationMetadata,
  RegisterRepositoryInput,
  RegisterRepositoryOutput,
  CreateConversationRepositoryInput,
  CreateConversationRepositoryOutput,
  AddParticipantsRepositoryInput,
  ParticipantWithUsername,
} from "../types/domain";
import {
  pgRegisterTransaction,
  pgCreateConversationTransaction,
  pgAddParticipantsTransaction,
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
    },
    conversation: {
      id: resultRegister.conversation.id,
      type: resultRegister.conversation.type as ConversationType,
      metadata: {
        name: resultRegister.conversation.metadata.name,
        creator: {
          id: resultRegister.conversation.metadata.userId,
          username: resultRegister.conversation.metadata.username,
        },
      },
    },
  };
}

export async function createConversationRepository(
  input: CreateConversationRepositoryInput
): Promise<CreateConversationRepositoryOutput> {
  const result = await pgCreateConversationTransaction(input);

  let participants = result.participants.map((p) => {
    return {
      ...p,
      ...input.participants.find((participant) => participant.id === p.user_id),
    };
  });

  return {
    conversation: {
      id: result.conversation.id,
      type: result.conversation.type as ConversationType,
      metadata: result.conversation.metadata as ConversationMetadata,
    },
    participants: participants.map((participant) => {
      return {
        userId: participant.user_id,
        username: participant.username,
        role: participant.role,
        lastSeen: participant.last_seen,
        joinedAt: participant.joined_at,
      } as ParticipantWithUsername;
    }),
  };
}

export async function addParticipantsRepository(
  input: AddParticipantsRepositoryInput
): Promise<Participant[]> {
  const result = await pgAddParticipantsTransaction(input);

  return result.map((participant) => {
    return {
      userId: participant.user_id,
      conversationId: participant.conversation_id,
      role: participant.role,
      lastSeen: participant.last_seen,
      joinedAt: participant.joined_at,
    };
  });
}

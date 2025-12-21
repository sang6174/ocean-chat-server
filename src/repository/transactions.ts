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
  CreateMessageRepositoryInput,
  CreateMessageTransactionRepositoryOutput,
} from "../types/domain";
import {
  pgRegisterTransaction,
  pgCreateConversationTransaction,
  pgAddParticipantsTransaction,
  pgSendMessageTransaction,
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

export async function sendMessageTransactionRepository(
  input: CreateMessageRepositoryInput
): Promise<CreateMessageTransactionRepositoryOutput> {
  const result = await pgSendMessageTransaction(input);

  const participants = result.participants.map((p) => {
    return {
      userId: p.user_id,
      username: p.username,
      role: p.role,
      joinedAt: p.joined_at,
      lastSeen: p.last_seen,
    } as ParticipantWithUsername;
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

import type {
  Participant,
  ConversationType,
  ConversationMetadata,
  PgErrorRepositoryOutput,
  ParticipantNoConversationId,
  RegisterRepositoryInput,
  RegisterRepositoryOutput,
  CreateConversationRepositoryInput,
  CreateConversationRepositoryOutput,
  GetConversationRepositoryInput,
  GetConversationRepositoryOutput,
  AddParticipantsRepositoryInput,
} from "../types/domain";
import { isPgError } from "../middlewares";
import {
  pgRegisterTransaction,
  pgCreateConversationTransaction,
  pgGetConversationTransaction,
  pgAddParticipantsTransaction,
} from "../models";
import type { BaseLogger } from "../helpers/logger";

export async function registerRepository(
  baseLogger: BaseLogger,
  input: RegisterRepositoryInput
): Promise<RegisterRepositoryOutput | PgErrorRepositoryOutput | null> {
  try {
    const resultRegister = await pgRegisterTransaction(baseLogger, input);

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
            userId: resultRegister.conversation.metadata.userId,
            username: resultRegister.conversation.metadata.username,
          },
        },
      },
    };
  } catch (err) {
    if (isPgError(err)) {
      return {
        code: err.code,
        table: err.table!,
        constraint: err.constraint!,
        detail: err.detail!,
      };
    } else if (err instanceof Error) {
      console.error("Generic error:", err.message);
      return null;
    } else {
      console.error("Unknown error:", err);
      return null;
    }
  }
}

export async function createConversationRepository(
  baseLogger: BaseLogger,
  input: CreateConversationRepositoryInput
): Promise<CreateConversationRepositoryOutput | null> {
  try {
    const result = await pgCreateConversationTransaction(baseLogger, input);
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
    return null;
  }
}

export async function addParticipantsRepository(
  baseLogger: BaseLogger,
  input: AddParticipantsRepositoryInput
): Promise<Participant[] | null> {
  try {
    const result = await pgAddParticipantsTransaction(baseLogger, input);

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
    return null;
  }
}

export async function getConversationRepository(
  baseLogger: BaseLogger,
  input: GetConversationRepositoryInput
): Promise<GetConversationRepositoryOutput | null> {
  try {
    const result = await pgGetConversationTransaction(baseLogger, input);
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

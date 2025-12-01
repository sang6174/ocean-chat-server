import type {
  ConversationMetadata,
  HttpResponse,
  Participant,
  ConversationIdentifier,
} from "../types";
import { ConversationType } from "../types";
import {
  pgCreateConversationWithParticipantsTransaction,
  pgGetParticipant,
  pgGetConversationIdentifiers,
} from "../models";

export async function createConversationService(
  type: ConversationType,
  metadata: ConversationMetadata,
  participantIds: string[]
): Promise<HttpResponse | null> {
  try {
    const result = await pgCreateConversationWithParticipantsTransaction(
      type,
      metadata,
      participantIds
    );
    if (!result || result.status !== 201) {
      return null;
    }

    if (type === ConversationType.Myself) {
      return {
        status: 201,
        message: "Create a new myself conversation is successful.",
      };
    } else if (type === ConversationType.Direct) {
      const users: Participant[] = [];
      for (const participantId of participantIds) {
        const user = await pgGetParticipant(participantId);
        if (!user) {
          throw new Error("Get user to invite a new group conversation error.");
        }
        users.push(user);
      }
      return {
        status: 201,
        message: "Create a new direct conversation is successful.",
      };
    } else if (type === ConversationType.Group) {
      return {
        status: 201,
        message: "Create a new group conversation is successful.",
      };
    } else {
      return result;
    }
  } catch (err) {
    console.log("createConversation error: ", err);
    return null;
  }
}

export async function getConversationIdentifiersServices(
  userId: string
): Promise<HttpResponse | ConversationIdentifier[] | null> {
  try {
    const conversationIdentifiers = await pgGetConversationIdentifiers(userId);
    if (!conversationIdentifiers) {
      return {
        status: 500,
        message: "Get conversation identifiers error.",
      };
    }
    return conversationIdentifiers;
  } catch (err) {
    console.log("getConversationIdsByUserId error: ", err);
    return null;
  }
}

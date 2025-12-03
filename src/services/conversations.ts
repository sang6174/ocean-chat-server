import { WsServerEvent } from "../types";
import type {
  ConversationMetadata,
  HttpResponse,
  ConversationIdentifier,
  PublishConversationCreated,
} from "../types";
import { ConversationType } from "../types";
import {
  pgCreateConversationWithParticipantsTransaction,
  pgGetConversationIdentifiers,
} from "../models";
import { eventBusServer } from "../websocket/events";

export async function createConversationService(
  type: ConversationType,
  metadata: ConversationMetadata,
  participantIds: string[],
  senderId: string,
  accessToken: string
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
      return {
        status: 201,
        message: "Create a new direct conversation is successful.",
      };
    } else if (type === ConversationType.Group) {
      eventBusServer.emit<PublishConversationCreated>(
        WsServerEvent.CONVERSATION_CREATED,
        {
          senderId,
          accessToken,
          recipientIds: participantIds,
          conversation: result.conversationResult.rows[0],
        }
      );
      return {
        status: 201,
        message: "Create a new group conversation is successful.",
      };
    } else {
      return result;
    }
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Create conversation service error.\n`,
      err
    );
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
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Get conversation identifiers service error.\n`,
      err
    );
    return null;
  }
}

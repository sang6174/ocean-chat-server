import { WsServerEvent } from "../types";
import type {
  ConversationMetadata,
  HttpResponse,
  ConversationIdentifier,
  PublishConversationCreated,
  GetConversationInput,
} from "../types";
import { ConversationType } from "../types";
import {
  pgCreateConversationWithParticipantsTransaction,
  pgGetConversationIdentifiers,
  pgGetConversationsTransaction,
} from "../models";
import { eventBusServer } from "../websocket/events";

export async function createConversationService(
  type: ConversationType,
  metadata: ConversationMetadata,
  participantIds: string[],
  senderId: string,
  accessToken?: string
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
      if (!accessToken) {
        return {
          status: 500,
          message: "No access token to broadcast to conversation.",
        };
      }
      eventBusServer.emit<PublishConversationCreated>(
        WsServerEvent.CONVERSATION_CREATED,
        {
          senderId,
          accessToken,
          recipientIds: participantIds,
          conversation: result.data,
        }
      );
      return {
        status: 201,
        message: "Create a new group conversation is successful.",
      };
    } else {
      return {
        status: result.status,
        message: result.message,
      };
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

export async function getConversationsService(userId: string) {
  try {
    const conversationIdentifiers = await pgGetConversationIdentifiers(userId);
    if (!conversationIdentifiers) {
      return {
        status: 500,
        message: "Get conversation identifiers error.",
      };
    }

    let result: GetConversationInput[] = [];
    for (const con of conversationIdentifiers) {
      const resultConversation = await pgGetConversationsTransaction(
        con.conversationId
      );
      if (!resultConversation) {
        return {
          status: 500,
          message: "Get a conversation error.",
        };
      }
      result.push(resultConversation.data);
    }

    return {
      status: 200,
      message: "Get conversation successfully",
      data: result,
    };
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Get all conversation for a user error.\n`,
      err
    );
    return null;
  }
}

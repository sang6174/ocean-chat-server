import { ConversationType, WsServerEvent } from "../types/domain";
import type {
  ConversationMetadata,
  ResponseDomain,
  GetConversationRepositoryInput,
  GetConversationRepositoryOutput,
  GetConversationDomainOutput,
  PublishConversationCreated,
} from "../types/domain";
import {
  createConversationRepository,
  getConversationsRepository,
  getConversationIdentifiersRepository,
} from "../repository";
import { eventBusServer } from "../websocket/events";

export async function createConversationService(
  type: ConversationType,
  metadata: ConversationMetadata,
  participantIds: string[],
  senderId: string,
  accessToken?: string
): Promise<ResponseDomain | null> {
  try {
    const resultCreateConversation = await createConversationRepository({
      type,
      metadata,
      participantIds,
    });
    if (!resultCreateConversation) {
      return null;
    }

    if (type === ConversationType.Myself) {
      return {
        status: 201,
        message: "Create a new myself conversation is successful.",
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
          conversation: resultCreateConversation,
        }
      );

      return {
        status: 201,
        message: "Create a new group conversation is successful.",
      };
    } else {
      return {
        status: 500,
        message:
          "Failed to create a conversation is invalid. Please try again.",
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

export async function getConversationsService(
  userId: string
): Promise<GetConversationDomainOutput[] | ResponseDomain | null> {
  try {
    const conversationIdentifiers = await getConversationIdentifiersRepository(
      userId
    );
    if (!conversationIdentifiers) {
      return {
        status: 500,
        message: "Get conversation identifiers error.",
      };
    }

    let result: GetConversationRepositoryOutput[] = [];
    for (const con of conversationIdentifiers) {
      const resultConversation = await getConversationsRepository({
        conversationId: con.id,
      } as GetConversationRepositoryInput);
      if (!resultConversation) {
        return {
          status: 500,
          message: "Get a conversation error.",
        };
      }
      const conversation: GetConversationRepositoryOutput = {
        conversation: resultConversation.conversation,
        participants: resultConversation.participants,
        messages: resultConversation.messages,
      };
      result.push(conversation);
    }

    return result;
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Get all conversation for a user error.\n`,
      err
    );
    return null;
  }
}

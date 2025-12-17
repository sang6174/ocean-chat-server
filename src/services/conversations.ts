import { ConversationType, WsServerEvent } from "../types/domain";
import type {
  ResponseDomain,
  GetConversationRepositoryOutput,
  GetConversationDomainInput,
  GetConversationDomainOutput,
  PublishConversationCreated,
  CreateConversationDomainInput,
} from "../types/domain";
import {
  createConversationRepository,
  getConversationRepository,
  getConversationIdentifiersRepository,
} from "../repository";
import { eventBusServer } from "../websocket/events";
import type { BaseLogger } from "../helpers/logger";

export async function createConversationService(
  baseLogger: BaseLogger,
  input: CreateConversationDomainInput
): Promise<ResponseDomain | null> {
  try {
    const resultCreateConversation = await createConversationRepository(
      baseLogger,
      {
        type: input.type,
        metadata: input.metadata,
        participantIds: input.participantIds,
      }
    );
    if (!resultCreateConversation) {
      return null;
    }

    if (input.type === ConversationType.Myself) {
      return {
        status: 201,
        message: "Create a new myself conversation is successful.",
      };
    } else if (input.type === ConversationType.Group) {
      if (!input.accessToken) {
        return {
          status: 500,
          message: "No access token to broadcast to conversation.",
        };
      }

      eventBusServer.emit<PublishConversationCreated>(
        WsServerEvent.CONVERSATION_CREATED,
        {
          senderId: input.senderId,
          accessToken: input.accessToken,
          recipientIds: input.participantIds,
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
    return null;
  }
}

export async function getConversationsService(
  baseLogger: BaseLogger,
  input: GetConversationDomainInput
): Promise<GetConversationDomainOutput[] | ResponseDomain | null> {
  try {
    const conversationIdentifiers = await getConversationIdentifiersRepository(
      baseLogger,
      input
    );

    if (!conversationIdentifiers) {
      return {
        status: 500,
        message: "Get conversation identifiers error.",
      };
    }

    let result: GetConversationRepositoryOutput[] = [];
    for (const con of conversationIdentifiers) {
      const resultConversation = await getConversationRepository(baseLogger, {
        conversationId: con.id,
      });

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
    return null;
  }
}

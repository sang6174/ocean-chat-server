import { WsServerEvent } from "../types/domain";
import type {
  SendMessageDomainInput,
  ResponseDomain,
  GetMessagesDomainOutput,
  GetMessagesDomainInput,
} from "../types/domain";
import {
  createMessageRepository,
  getMessagesRepository,
  getParticipantIdsRepository,
} from "../repository";
import { eventBusServer } from "../websocket/events";
import type { BaseLogger } from "../helpers/logger";

export async function sendMessageService(
  baseLogger: BaseLogger,
  input: SendMessageDomainInput
): Promise<ResponseDomain | null> {
  try {
    // Create a new message in database
    const resultCreateMessage = await createMessageRepository(baseLogger, {
      senderId: input.senderId,
      conversationId: input.conversation.id,
      content: input.message,
    });
    if (!resultCreateMessage) {
      return {
        status: 500,
        message: "Failed to save a new message into database.",
      };
    }

    // Get ids of participants in conversation
    const resultParticipantIds = await getParticipantIdsRepository(baseLogger, {
      conversationId: input.conversation.id,
    });

    if (!resultParticipantIds) {
      return {
        status: 500,
        message: "Failed to get participant of the room from database.",
      };
    }

    const inputWsEvent = {
      senderId: input.senderId,
      accessToken: input.accessToken,
      conversationIdentifier: input.conversation,
      recipientIds: resultParticipantIds.map(
        (participant) => participant.userId
      ),
      message: input.message,
    };
    eventBusServer.emit(WsServerEvent.MESSAGE_CREATED, inputWsEvent);

    return {
      status: 201,
      message: "send message via http successfully",
    };
  } catch (err) {
    return null;
  }
}

export async function getMessagesService(
  baseLogger: BaseLogger,
  input: GetMessagesDomainInput
): Promise<GetMessagesDomainOutput[] | null> {
  try {
    const result = await getMessagesRepository(baseLogger, {
      conversationId: input.conversationId,
      limit: input.limit ?? 10,
      offset: input.offset ?? 0,
    });
    return result;
  } catch (err) {
    return null;
  }
}

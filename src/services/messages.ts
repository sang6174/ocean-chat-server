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

export async function sendMessageService({
  senderId,
  accessToken,
  conversation,
  message,
}: SendMessageDomainInput): Promise<ResponseDomain | null> {
  try {
    // Create a new message in database
    const resultCreateMessage = await createMessageRepository({
      conversationId: conversation.id,
      senderId,
      content: message,
    });
    if (!resultCreateMessage) {
      return {
        status: 500,
        message: "Failed to save a new message into database.",
      };
    }

    // Get ids of participants in conversation
    const resultParticipantIds = await getParticipantIdsRepository({
      conversationId: conversation.id,
    });
    if (!resultParticipantIds) {
      return {
        status: 500,
        message: "Failed to get participant of the room from database.",
      };
    }

    eventBusServer.emit(WsServerEvent.MESSAGE_CREATED, {
      senderId,
      accessToken,
      conversationIdentifier: conversation,
      recipientIds: resultParticipantIds.map(
        (participant) => participant.userId
      ),
      message,
    });

    return {
      status: 201,
      message: "send message via http successfully",
    };
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Create message service error.\n`,
      err
    );
    return null;
  }
}

export async function getMessagesService({
  conversationId,
  limit = 10,
  offset = 0,
}: GetMessagesDomainInput): Promise<GetMessagesDomainOutput[] | null> {
  try {
    const result = await getMessagesRepository({
      conversationId,
      limit,
      offset,
    });
    return result;
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Get messages error.\n`,
      err
    );
    return null;
  }
}

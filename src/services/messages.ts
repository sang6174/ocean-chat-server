import { WsServerEvent } from "../types";
import type { ConversationIdentifier, HttpResponse } from "../types";
import { pgCreateMessage, pgGetParticipantIds } from "../models";
import { eventBusServer } from "../websocket/events";

export async function createMessageService(
  senderId: string,
  accessToken: string,
  conversation: ConversationIdentifier,
  message: string
): Promise<HttpResponse | null> {
  try {
    const createMessageResult = await pgCreateMessage(
      conversation.conversationId,
      senderId,
      message
    );

    if (!createMessageResult) {
      return {
        status: 500,
        message: "Failed to save a new message into database.",
      };
    }

    const resultParticipants = await pgGetParticipantIds(
      conversation.conversationId
    );
    if (!resultParticipants) {
      return {
        status: 500,
        message: "Failed to get participant of the room from database.",
      };
    }

    eventBusServer.emit(WsServerEvent.MESSAGE_CREATED, {
      senderId,
      accessToken,
      conversationIdentifier: conversation,
      recipientIds: resultParticipants,
      message,
    });

    return {
      status: 201,
      message: "send message via http successfully",
    };
  } catch (err) {
    console.log(`Create message service error: `, err);
    return null;
  }
}

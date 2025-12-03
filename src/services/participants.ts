import { WsServerEvent } from "../types";
import type { HttpResponse } from "../types";
import {
  pgGetParticipantRole,
  pgAddParticipantsTransaction,
  pgGetConversationIdentifier,
  pgGetConversationsTransaction,
  pgGetParticipantIds,
} from "../models";
import { eventBusServer } from "../websocket/events";

export async function addParticipantsService(
  userId: string,
  accessToken: string,
  conversationId: string,
  participantIds: string[]
): Promise<HttpResponse | null> {
  try {
    const userRole = await pgGetParticipantRole(userId, conversationId);
    if (!userRole) {
      return {
        status: 403,
        message: "Only group admins can add new participants.",
      };
    }

    const resultOldParticipants = await pgGetParticipantIds(conversationId);
    if (!resultOldParticipants) {
      return {
        status: 500,
        message: "Get old participants from database error.",
      };
    }

    const resultAddParticipant = await pgAddParticipantsTransaction(
      conversationId,
      participantIds
    );
    if (!resultAddParticipant) {
      return {
        status: 500,
        message: "Save all new participants to database error.",
      };
    }

    const resultConversationIdentifier = await pgGetConversationIdentifier(
      userId,
      conversationId
    );
    if (!resultConversationIdentifier) {
      return {
        status: 500,
        message: "Get conversation identifier from database error.",
      };
    }

    const resultFullConversation = await pgGetConversationsTransaction(
      conversationId
    );

    eventBusServer.emit(WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS, {
      senderId: userId,
      accessToken,
      oldParticipants: resultOldParticipants,
      newParticipants: participantIds,
      conversationIdentifier: resultConversationIdentifier,
      fullConversation: resultFullConversation.data,
    });

    return {
      status: 201,
      message: "Add participants successfully.",
    };
  } catch (err) {
    console.log(
      `[SERVICE_ERROR] - ${new Date().toISOString()} - Add participants service error.\n`,
      err
    );
    return null;
  }
}

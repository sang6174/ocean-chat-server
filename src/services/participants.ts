import { ConversationRoleType, WsServerEvent } from "../types/domain";
import type {
  ResponseDomain,
  AddParticipantsDomainInput,
  GetConversationRepositoryInput,
  GetConversationRepositoryOutput,
} from "../types/domain";
import { eventBusServer } from "../websocket/events";
import {
  getParticipantRole,
  getParticipantIds,
  addParticipants,
  getConversationRepository,
} from "../repository";

export async function addParticipantsService({
  userId,
  accessToken,
  conversation,
  participantIds,
}: AddParticipantsDomainInput): Promise<ResponseDomain | null> {
  try {
    // Check role user in conversation
    const userRole = await getParticipantRole({
      userId,
      conversationId: conversation.id,
    });
    if (!userRole) {
      return {
        status: 500,
        message: "Query database error. please try again.",
      };
    }
    if (userRole.role !== ConversationRoleType.ADMIN) {
      return {
        status: 403,
        message: "Only group admins can add new participants.",
      };
    }

    // Get the old participants
    const resultOldParticipants = await getParticipantIds(conversation.id);
    if (!resultOldParticipants) {
      return {
        status: 500,
        message: "Get old participants from database error.",
      };
    }
    console.log(resultOldParticipants);

    // Add the new participants
    const resultAddParticipant = await addParticipants({
      conversationId: conversation.id,
      participantIds,
    });
    if (!resultAddParticipant) {
      return {
        status: 500,
        message: "Save all new participants to database error.",
      };
    }
    console.log(resultAddParticipant);
    // Add the event messages for each the new participants

    // Get the new conversation
    const resultConversation = await getConversationRepository({
      conversationId: conversation.id,
    } as GetConversationRepositoryInput);
    if (!resultConversation) {
      return null;
    }

    // Broadcast/Send to participants
    eventBusServer.emit(WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS, {
      senderId: userId,
      accessToken,
      oldParticipants: resultOldParticipants.map((participant) => {
        return participant.userId;
      }),
      newParticipants: participantIds,
      conversation: resultConversation,
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

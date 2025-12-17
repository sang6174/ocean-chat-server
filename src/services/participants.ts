import { ConversationRoleType, WsServerEvent } from "../types/domain";
import type {
  ResponseDomain,
  AddParticipantsDomainInput,
} from "../types/domain";
import { eventBusServer } from "../websocket/events";
import {
  getParticipantRoleRepository,
  getParticipantIdsRepository,
  addParticipantsRepository,
  getConversationRepository,
} from "../repository";
import type { BaseLogger } from "../helpers/logger";

export async function addParticipantsService(
  baseLogger: BaseLogger,
  input: AddParticipantsDomainInput
): Promise<ResponseDomain | null> {
  try {
    // Check role user in conversation
    const userRole = await getParticipantRoleRepository(baseLogger, {
      userId: input.userId,
      conversationId: input.conversation.id,
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
    const resultOldParticipants = await getParticipantIdsRepository(
      baseLogger,
      {
        conversationId: input.conversation.id,
      }
    );

    if (!resultOldParticipants) {
      return {
        status: 500,
        message: "Get old participants from database error.",
      };
    }

    // Add the new participants
    const resultAddParticipant = await addParticipantsRepository(baseLogger, {
      conversationId: input.conversation.id,
      participantIds: input.participantIds,
    });

    if (!resultAddParticipant) {
      return {
        status: 500,
        message: "Save all new participants to database error.",
      };
    }
    console.log(resultAddParticipant);

    // Get the new conversation
    const resultConversation = await getConversationRepository(baseLogger, {
      conversationId: input.conversation.id,
      limit: 10,
      offset: 0,
    });
    if (!resultConversation) {
      return null;
    }

    // Broadcast/Send to participants
    eventBusServer.emit(WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS, {
      senderId: input.userId,
      accessToken: input.accessToken,
      oldParticipants: resultOldParticipants.map((participant) => {
        return participant.userId;
      }),
      newParticipants: input.participantIds,
      conversation: resultConversation,
    });

    return {
      status: 201,
      message: "Add participants successfully.",
    };
  } catch (err) {
    return null;
  }
}

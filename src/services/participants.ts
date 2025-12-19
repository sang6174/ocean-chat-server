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
import { DomainError } from "../helpers/errors";

export async function addParticipantsService(
  input: AddParticipantsDomainInput
): Promise<ResponseDomain> {
  const userRole = await getParticipantRoleRepository({
    userId: input.creator.id,
    conversationId: input.conversationId,
  });

  if (!userRole || (userRole && userRole.role !== "admin")) {
    throw new DomainError({
      status: 401,
      code: "AUTHORIZATION_ERROR",
      message: "The user is not permission to add new participants",
    });
  }

  let resultOldParticipants = await getParticipantIdsRepository({
    conversationId: input.conversationId,
  });

  if (!resultOldParticipants) {
    resultOldParticipants = [];
  }

  const resultAddParticipant = await addParticipantsRepository({
    conversationId: input.conversationId,
    participantIds: input.participantIds,
  });

  console.log(resultAddParticipant);

  const resultConversation = await getConversationRepository({
    conversationId: input.conversationId,
    limit: 10,
    offset: 0,
  });

  // Broadcast/Send to participants
  eventBusServer.emit(WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS, {
    senderId: input.creator.id,
    accessToken: input.authToken,
    oldParticipants: resultOldParticipants.map((participant) => {
      return participant.userId;
    }),
    newParticipants: input.participantIds,
    conversation: resultConversation,
  });

  return {
    status: 201,
    code: "ADD_PARTICIPANT_SUCCESS",
    message: "Add participants successfully.",
  };
}

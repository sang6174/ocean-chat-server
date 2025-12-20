import { WsServerEvent } from "../types/domain";
import type {
  ResponseDomain,
  AddParticipantsDomainInput,
} from "../types/domain";
import { eventBusServer } from "../websocket/events";
import {
  getParticipantRoleRepository,
  addParticipantsRepository,
  getConversationRepository,
  getParticipantWithUsernameRepository,
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

  let resultOldParticipants = await getParticipantWithUsernameRepository({
    conversationId: input.conversationId,
  });

  if (!resultOldParticipants) {
    resultOldParticipants = [];
  }

  const resultParticipants = await addParticipantsRepository({
    conversationId: input.conversationId,
    participantIds: input.participants.map((p) => p.id),
  });

  const resultConversation = await getConversationRepository({
    conversationId: input.conversationId,
    limit: 10,
    offset: 0,
  });

  // Broadcast/Send to participants
  eventBusServer.emit(WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS, {
    sender: input.creator,
    authToken: input.authToken,
    oldParticipants: resultOldParticipants,
    newParticipants: resultParticipants,
    conversationId: resultConversation?.conversation.id,
    conversation: resultConversation,
  });

  return {
    status: 201,
    code: "ADD_PARTICIPANT_SUCCESS",
    message: "Add participants successfully.",
  };
}

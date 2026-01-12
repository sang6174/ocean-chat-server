import { WsServerEvent } from "../types/domain";
import type {
  ResponseDomain,
  AddParticipantsDomainInput,
} from "../types/domain";
import { eventBusServer } from "../websocket/events";
import {
  getParticipantRoleRepository,
  addParticipantsRepository,
  getConversationByIdRepository,
  getParticipantsByConversationIdRepository,
  checkFriendshipRepository,
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

  // Check friendship: Admin must be friend with all new participants
  for (const participantId of input.participantIds) {
    const isFriend = await checkFriendshipRepository(
      input.creator.id,
      participantId
    );

    if (!isFriend) {
      throw new DomainError({
        status: 403,
        code: "NOT_FRIEND",
        message: `You are not friends with user ${participantId}. Cannot add to group.`,
      });
    }
  }

  let resultOldParticipants = await getParticipantsByConversationIdRepository({
    conversationId: input.conversationId,
  });

  if (!resultOldParticipants) {
    resultOldParticipants = [];
  }

  const resultParticipants = await addParticipantsRepository({
    conversationId: input.conversationId,
    creator: input.creator,
    participantIds: input.participantIds,
  });

  const resultConversation = await getConversationByIdRepository({
    conversationId: input.conversationId,
    limit: 10,
    offset: 0,
  });

  // Broadcast/Send to participants
  eventBusServer.emit(WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS, {
    sender: input.creator,
    oldParticipants: resultOldParticipants,
    newParticipants: resultParticipants,
    conversation: resultConversation,
  });

  return {
    status: 201,
    code: "ADD_PARTICIPANT_SUCCESS",
    message: "Add participants successfully.",
  };
}

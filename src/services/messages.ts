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
import { DomainError } from "../helpers/errors";

export async function sendMessageService(
  input: SendMessageDomainInput
): Promise<ResponseDomain> {
  await createMessageRepository({
    senderId: input.sender.id,
    conversationId: input.conversationId,
    content: input.message,
  });

  const resultParticipantIds = await getParticipantIdsRepository({
    conversationId: input.conversationId,
  });

  if (!resultParticipantIds) {
    throw new DomainError({
      status: 400,
      code: "CONVERSATION_ID_INVALID",
      message: "conversationId is invalid",
    });
  }

  const inputWsEvent = {
    senderId: input.sender.id,
    accessToken: input.authToken,
    conversationId: input.conversationId,
    recipientIds: resultParticipantIds.map((participant) => participant.userId),
    message: input.message,
  };
  eventBusServer.emit(WsServerEvent.MESSAGE_CREATED, inputWsEvent);

  return {
    status: 201,
    code: "SEND_MESSAGE_SUCCESS",
    message: "Send message successfully",
  };
}

export async function getMessagesService(
  input: GetMessagesDomainInput
): Promise<GetMessagesDomainOutput[]> {
  const result = await getMessagesRepository({
    conversationId: input.conversationId,
    limit: input.limit ?? 10,
    offset: input.offset ?? 0,
  });

  return result;
}

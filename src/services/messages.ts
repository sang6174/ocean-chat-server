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
  getParticipantWithUsernameRepository,
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

  const resultParticipants = await getParticipantWithUsernameRepository({
    conversationId: input.conversationId,
  });

  if (!resultParticipants) {
    throw new DomainError({
      status: 400,
      code: "CONVERSATION_ID_INVALID",
      message: "conversationId is invalid",
    });
  }

  const inputWsEvent = {
    authToken: input.authToken,
    sender: input.sender,
    recipients: resultParticipants.map((p) => {
      return { id: p.userId, username: p.username };
    }),
    conversationId: input.conversationId,
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

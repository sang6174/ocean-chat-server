import { WsServerEvent } from "../types/domain";
import type {
  SendMessageDomainInput,
  ResponseDomain,
  GetMessagesByConversationIdDomainOutput,
  GetMessagesByConversationIdDomainInput,
} from "../types/domain";
import { createMessageRepository, getMessagesRepository } from "../repository";
import { eventBusServer } from "../websocket/events";

export async function sendMessageService(
  input: SendMessageDomainInput
): Promise<ResponseDomain> {
  const result = await createMessageRepository({
    senderId: input.sender.id,
    conversationId: input.conversationId,
    content: input.message,
  });

  const participantIds = result.participants.map((p) => p.user.id);
  if (participantIds.length === 0) {
    console.warn(
      `sendMessageService: No participants found for conversation ${input.conversationId}`
    );
  }

  const inputWsEvent = {
    sender: input.sender,
    recipients: result.participants.map((p) => {
      return { id: p.user.id, username: p.user.username };
    }),
    message: result.message,
  };

  eventBusServer.emit(WsServerEvent.MESSAGE_CREATED, inputWsEvent);

  return {
    status: 201,
    code: "SEND_MESSAGE_SUCCESS",
    message: "Send message successfully",
  };
}

export async function getMessagesService(
  input: GetMessagesByConversationIdDomainInput
): Promise<GetMessagesByConversationIdDomainOutput[]> {
  const result = await getMessagesRepository({
    conversationId: input.conversationId,
    limit: input.limit ?? 10,
    offset: input.offset ?? 0,
  });

  return result;
}

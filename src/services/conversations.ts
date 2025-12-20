import { ConversationType, WsServerEvent } from "../types/domain";
import type {
  ResponseDomain,
  GetConversationRepositoryOutput,
  GetConversationDomainInput,
  GetConversationDomainOutput,
  PublishConversationCreated,
  CreateConversationDomainInput,
  CreateConversationRepositoryOutput,
} from "../types/domain";
import {
  createConversationRepository,
  getConversationRepository,
  getConversationIdsRepository,
} from "../repository";
import { eventBusServer } from "../websocket/events";
import { DomainError } from "../helpers/errors";

export async function createConversationService(
  input: CreateConversationDomainInput
): Promise<CreateConversationRepositoryOutput> {
  const resultCreateConversation = await createConversationRepository({
    type: input.type,
    metadata: input.metadata,
    participantIds: input.participantIds,
  });

  if (input.type === ConversationType.Group) {
    eventBusServer.emit<PublishConversationCreated>(
      WsServerEvent.CONVERSATION_CREATED,
      {
        senderId: input.creator.id,
        authToken: input.authToken,
        recipientIds: input.participantIds,
        conversation: resultCreateConversation,
      }
    );
  }

  return resultCreateConversation;
}

export async function getConversationsService(
  input: GetConversationDomainInput
): Promise<GetConversationDomainOutput[]> {
  const conversation = await getConversationIdsRepository(input);
  if (!conversation) {
    throw new DomainError({
      status: 400,
      code: "USER_ID_INVALID",
      message: "userId is invalid",
    });
  }

  let result: GetConversationRepositoryOutput[] = [];
  for (const conId of conversation.ids) {
    const resultConversation = await getConversationRepository({
      conversationId: conId,
      limit: 10,
      offset: 0,
    });

    if (!resultConversation) {
      throw new DomainError({
        status: 500,
        code: "CONVERSATION_ID_INVALID",
        message: "conversationId is invalid",
      });
    }

    const conversation: GetConversationRepositoryOutput = {
      conversation: resultConversation.conversation,
      participants: resultConversation.participants,
      messages: resultConversation.messages,
    };
    result.push(conversation);
  }

  return result;
}

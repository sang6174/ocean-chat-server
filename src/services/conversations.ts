import { ConversationType, WsServerEvent } from "../types/domain";
import type {
  GetConversationByIdRepositoryOutput,
  GetConversationsByUserIdDomainInput,
  GetConversationsByUserIdDomainOutput,
  PublishConversationCreated,
  CreateGroupConversationDomainInput,
  CreateConversationRepositoryOutput,
} from "../types/domain";
import {
  createConversationRepository,
  getConversationByIdRepository,
  getConversationIdsRepository,
} from "../repository";
import { eventBusServer } from "../websocket/events";
import { DomainError } from "../helpers/errors";

export async function createConversationService(
  input: CreateGroupConversationDomainInput
): Promise<CreateConversationRepositoryOutput> {
  const resultCreateConversation = await createConversationRepository(input);

  if (input.type === ConversationType.Group) {
    eventBusServer.emit<PublishConversationCreated>(
      WsServerEvent.CONVERSATION_CREATED,
      {
        sender: input.creator,
        recipients: resultCreateConversation.participants.map((p) => p.user),
        conversation: resultCreateConversation,
      }
    );
  }

  return resultCreateConversation;
}

export async function getConversationsByUserIdService(
  input: GetConversationsByUserIdDomainInput
): Promise<GetConversationsByUserIdDomainOutput[]> {
  const conversation = await getConversationIdsRepository(input);
  if (!conversation) {
    throw new DomainError({
      status: 400,
      code: "USER_ID_INVALID",
      message: "userId is invalid",
    });
  }

  let result: GetConversationByIdRepositoryOutput[] = [];
  for (const conId of conversation.ids) {
    const resultConversation = await getConversationByIdRepository({
      conversationId: conId,
      limit: 20,
      offset: 0,
    });

    const conversation: GetConversationByIdRepositoryOutput = {
      conversation: resultConversation.conversation,
      participants: resultConversation.participants,
      messages: resultConversation.messages,
    };
    result.push(conversation);
  }
  return result;
}

import type {
  ResponseDomain,
  CreateConversationDomainInput,
  CreateConversationRepositoryOutput,
  GetConversationIdentifiersRepositoryInput,
  ConversationIdentifier,
} from "../types/domain";
import { getConversationIdentifiersRepository } from "../repository";
import {
  createConversationService,
  getConversationsService,
} from "../services";
import type { BaseLogger } from "../helpers/logger";

export async function createConversationController(
  baseLogger: BaseLogger,
  input: CreateConversationDomainInput
): Promise<CreateConversationRepositoryOutput | ResponseDomain | null> {
  const result = await createConversationService(baseLogger, input);
  return result;
}

export async function getConversationIdentifiersController(
  baseLogger: BaseLogger,
  input: GetConversationIdentifiersRepositoryInput
): Promise<ConversationIdentifier[] | ResponseDomain | null> {
  const conversationIdentifiers = await getConversationIdentifiersRepository(
    baseLogger,
    input
  );
  return conversationIdentifiers;
}

export async function getConversationsController(
  baseLogger: BaseLogger,
  userId: string
) {
  const conversations = await getConversationsService(baseLogger, { userId });
  return conversations;
}

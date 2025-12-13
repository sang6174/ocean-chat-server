import { ConversationType } from "../types/domain";
import type {
  ResponseDomain,
  ConversationMetadata,
  CreateConversationRepositoryOutput,
  ConversationIdentifier,
} from "../types/domain";
import { getConversationIdentifiersRepository } from "../repository";
import {
  createConversationService,
  getConversationsService,
} from "../services";

export async function createConversationController(
  type: ConversationType,
  metadata: ConversationMetadata,
  participantIds: string[],
  senderId: string,
  accessToken: string
): Promise<CreateConversationRepositoryOutput | ResponseDomain | null> {
  const result = await createConversationService(
    type,
    metadata,
    participantIds,
    senderId,
    accessToken
  );
  return result;
}

export async function getConversationIdentifiersController(
  userId: string
): Promise<ConversationIdentifier[] | ResponseDomain | null> {
  const conversationIdentifiers = await getConversationIdentifiersRepository({
    userId,
  });
  return conversationIdentifiers;
}

export async function getConversationsController(userId: string) {
  const conversations = await getConversationsService(userId);
  return conversations;
}

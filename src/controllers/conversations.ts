import type {
  ConversationType,
  ConversationMetadata,
  ConversationIdentifier,
  HttpResponse,
} from "../types";
import {
  createConversationService,
  getConversationIdentifiersServices,
} from "../services";

export async function createConversationController(
  type: ConversationType,
  metadata: ConversationMetadata,
  participants: string[],
  senderId: string,
  accessToken: string
): Promise<HttpResponse | null> {
  const result = await createConversationService(
    type,
    metadata,
    participants,
    senderId,
    accessToken
  );
  return result;
}

export async function getConversationIdentifiersController(
  userId: string
): Promise<HttpResponse | ConversationIdentifier[] | null> {
  const conversationIdentifiers = await getConversationIdentifiersServices(
    userId
  );
  return conversationIdentifiers;
}

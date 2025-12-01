import type {
  ConversationType,
  ConversationMetadata,
  HttpResponse,
} from "../types";
import { createConversationService } from "../services";

export async function createConversationController(
  type: ConversationType,
  metadata: ConversationMetadata,
  participantIds: string[]
): Promise<HttpResponse | null> {
  const result = await createConversationService(
    type,
    metadata,
    participantIds
  );
  return result;
}

import type { HttpResponse, ConversationIdentifier } from "../types";
import { addParticipantsService } from "../services";

export async function addParticipantsController(
  userId: string,
  conversation: ConversationIdentifier,
  participantIds: string[]
): Promise<HttpResponse | null> {
  const result = await addParticipantsService(
    conversation.conversationId,
    userId,
    participantIds
  );
  return result;
}

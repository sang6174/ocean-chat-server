import type { HttpResponse, ConversationIdentifier } from "../types";
import { addParticipantsService } from "../services";

export async function addParticipantsController(
  userId: string,
  accessToken: string,
  conversation: ConversationIdentifier,
  participantIds: string[]
): Promise<HttpResponse | null> {
  const result = await addParticipantsService(
    conversation.conversationId,
    accessToken,
    userId,
    participantIds
  );
  return result;
}

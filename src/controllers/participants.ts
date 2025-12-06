import type { ResponseDomain, ConversationIdentifier } from "../types/domain";
import { addParticipantsService } from "../services";

export async function addParticipantsController(
  userId: string,
  accessToken: string,
  conversation: ConversationIdentifier,
  participantIds: string[]
): Promise<ResponseDomain | null> {
  const result = await addParticipantsService({
    userId,
    accessToken,
    conversation,
    participantIds,
  });
  return result;
}

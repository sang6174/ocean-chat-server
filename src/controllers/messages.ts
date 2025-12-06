import type { ConversationIdentifier, ResponseDomain } from "../types/domain";
import { sendMessageService, getMessagesService } from "../services";

export async function sendMessageController(
  senderId: string,
  accessToken: string,
  conversation: ConversationIdentifier,
  message: string
): Promise<ResponseDomain | null> {
  const result = await sendMessageService({
    senderId,
    accessToken,
    conversation,
    message,
  });
  return result;
}

export async function getMessagesController(
  conversationId: string,
  limit: number = 10,
  offset: number = 0
) {
  const result = getMessagesService({ conversationId, limit, offset });
  return result;
}

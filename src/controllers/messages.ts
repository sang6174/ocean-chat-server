import type { ConversationIdentifier, HttpResponse } from "../types";
import { createMessageService, getMessagesService } from "../services";

export async function sendMessageController(
  senderId: string,
  accessToken: string,
  conversation: ConversationIdentifier,
  message: string
): Promise<HttpResponse | null> {
  const result = await createMessageService(
    senderId,
    accessToken,
    conversation,
    message
  );
  return result;
}

export async function getMessagesController(
  conversationId: string,
  limit: number = 10,
  offset: number = 0
) {
  const result = getMessagesService(conversationId, limit, offset);
  return result;
}

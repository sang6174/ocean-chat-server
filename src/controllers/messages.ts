import type { ConversationIdentifier, HttpResponse } from "../types";
import { createMessageService } from "../services";

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

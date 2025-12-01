import type { ConversationIdentifier, HttpResponse } from "../types";
import { pgCreateMessage } from "../models";

export async function createMessageService(
  senderId: string,
  conversation: ConversationIdentifier,
  message: string
): Promise<HttpResponse | null> {
  try {
    const createMessageResult = await pgCreateMessage(
      conversation.conversationId,
      senderId,
      message
    );

    if (!createMessageResult) {
      return {
        status: 500,
        message: "Failed to save a new message into database.",
      };
    }

    return {
      status: 201,
      message: "send message via http successfully",
    };
  } catch (err) {
    console.log(`Create message service error: `, err);
    return null;
  }
}

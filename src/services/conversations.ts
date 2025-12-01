import type { ConversationMetadata, HttpResponse, Participant } from "../types";
import { ConversationType } from "../types";
import {
  pgCreateConversationWithParticipantsTransaction,
  pgGetParticipant,
} from "../models";

export async function createConversationService(
  type: ConversationType,
  metadata: ConversationMetadata,
  participantIds: string[]
): Promise<HttpResponse | null> {
  try {
    const result = await pgCreateConversationWithParticipantsTransaction(
      type,
      metadata,
      participantIds
    );
    if (!result || result.status !== 201) {
      return null;
    }

    if (type === ConversationType.Myself) {
      return {
        status: 201,
        message: "Create a new myself conversation is successful.",
      };
    } else if (type === ConversationType.Direct) {
      const users: Participant[] = [];
      for (const participantId of participantIds) {
        const user = await pgGetParticipant(participantId);
        if (!user) {
          throw new Error("Get user to invite a new group conversation error.");
        }
        users.push(user);
      }
      return {
        status: 201,
        message: "Create a new direct conversation is successful.",
      };
    } else if (type === ConversationType.Group) {
      return {
        status: 201,
        message: "Create a new group conversation is successful.",
      };
    } else {
      return result;
    }
  } catch (err) {
    console.log("createConversation error: ", err);
    return null;
  }
}

import type { BaseLogger } from "../helpers/logger";
import { createConversationRepository } from "../repository";
import {
  ConversationType,
  WsServerEvent,
  type ResponseDomain,
  type CreateConversationRepositoryOutput,
} from "../types/domain";
import { eventBusServer } from "../websocket/events";

export async function notificationAddFriendController(
  baseLogger: BaseLogger,
  input: {
    senderId: string;
    senderUsername: string;
    recipientId: string;
  }
) {
  try {
    eventBusServer.emit(WsServerEvent.NOTIFICATION_ADD_FRIEND, {
      senderId: input.senderId,
      senderUsername: input.senderUsername,
      recipientId: input.recipientId,
    });
    return {
      status: 200,
      message: "Send add friend invitation is successful.",
    };
  } catch (err) {
    return {
      status: 500,
      message: "Server error. Please try again.",
    };
  }
}

export async function notificationAcceptFriendController(
  baseLogger: BaseLogger,
  input: {
    senderId: string;
    recipientId: string;
  }
): Promise<CreateConversationRepositoryOutput | ResponseDomain> {
  try {
    const resultConversation = await createConversationRepository(baseLogger, {
      type: ConversationType.Direct,
      metadata: {
        name: "",
        creator: {
          userId: "",
          username: "",
        },
      },
      participantIds: [input.recipientId, input.senderId],
    });

    if (!resultConversation) {
      return {
        status: 500,
        message:
          "Create the new conversation for two users error. Please try again.",
      };
    }

    eventBusServer.emit(WsServerEvent.NOTIFICATION_ACCEPTED_FRIEND, {
      senderId: input.senderId,
      recipientId: input.senderId,
      data: resultConversation,
    });
    return resultConversation;
  } catch (err) {
    return {
      status: 500,
      message: "Server error. Please try again.",
    };
  }
}

export async function notificationDenyFriendController(
  baseLogger: BaseLogger,
  input: {
    senderId: string;
    senderUsername: string;
    recipientId: string;
  }
) {
  try {
    eventBusServer.emit(WsServerEvent.NOTIFICATION_DENIED_FRIEND, {
      senderId: input.senderId,
      senderUsername: input.senderUsername,
      recipientId: input.recipientId,
    });
    return {
      status: 200,
      message: "Send denied notification is successful.",
    };
  } catch (err) {
    return {
      status: 500,
      message: "Server error. Please try again.",
    };
  }
}

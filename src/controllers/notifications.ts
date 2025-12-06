import { createConversationRepository } from "../repository";
import {
  ConversationType,
  WsServerEvent,
  type ResponseDomain,
  type CreateConversationRepositoryOutput,
} from "../types/domain";
import { eventBusServer } from "../websocket/events";

export async function notificationAddFriendController({
  senderId,
  senderUsername,
  recipientId,
}: {
  senderId: string;
  senderUsername: string;
  recipientId: string;
}) {
  try {
    eventBusServer.emit(WsServerEvent.NOTIFICATION_ADD_FRIEND, {
      senderId,
      senderUsername,
      recipientId,
    });
    return {
      status: 200,
      message: "Send add friend invitation is successful.",
    };
  } catch (err) {
    console.log(
      `[CONTROLLER_ERROR] - ${new Date().toISOString()} - Publish notification add friend error.\n`,
      err
    );
    return {
      status: 500,
      message: "Server error. Please try again.",
    };
  }
}

export async function notificationAcceptFriendController({
  senderId,
  recipientId,
}: {
  senderId: string;
  recipientId: string;
}): Promise<CreateConversationRepositoryOutput | ResponseDomain> {
  try {
    const resultConversation = await createConversationRepository({
      type: ConversationType.Direct,
      metadata: {
        name: "",
        creator: recipientId,
      },
      participantIds: [recipientId, senderId],
    });

    if (!resultConversation) {
      return {
        status: 500,
        message:
          "Create the new conversation for two users error. Please try again.",
      };
    }

    eventBusServer.emit(WsServerEvent.NOTIFICATION_ACCEPTED_FRIEND, {
      senderId,
      recipientId,
      data: resultConversation,
    });
    return resultConversation;
  } catch (err) {
    console.log(
      `[CONTROLLER_ERROR] - ${new Date().toISOString()} - Publish notification added friend error.\n`,
      err
    );
    return {
      status: 500,
      message: "Server error. Please try again.",
    };
  }
}

export async function notificationDenyFriendController({
  senderId,
  senderUsername,
  recipientId,
}: {
  senderId: string;
  senderUsername: string;
  recipientId: string;
}) {
  try {
    eventBusServer.emit(WsServerEvent.NOTIFICATION_DENIED_FRIEND, {
      senderId,
      senderUsername,
      recipientId,
    });
    return {
      status: 200,
      message: "Send denied notification is successful.",
    };
  } catch (err) {
    console.log(
      `[CONTROLLER_ERROR] - ${new Date().toISOString()} - Publish notification denied friend error.\n`,
      err
    );
    return {
      status: 500,
      message: "Server error. Please try again.",
    };
  }
}

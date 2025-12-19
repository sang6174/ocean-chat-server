import { createConversationRepository } from "../repository";
import {
  ConversationType,
  WsServerEvent,
  type CreateConversationRepositoryOutput,
} from "../types/domain";
import { eventBusServer } from "../websocket/events";

export async function notificationAddFriendController(input: {
  senderId: string;
  senderUsername: string;
  recipientId: string;
}) {
  eventBusServer.emit(WsServerEvent.NOTIFICATION_ADD_FRIEND, {
    senderId: input.senderId,
    senderUsername: input.senderUsername,
    recipientId: input.recipientId,
  });

  return {
    status: 200,
    code: "ADDED_FRIEND",
    message: "Send add friend invitation is successful.",
  };
}

export async function notificationAcceptFriendController(input: {
  senderId: string;
  recipientId: string;
}): Promise<CreateConversationRepositoryOutput> {
  const resultConversation = await createConversationRepository({
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

  eventBusServer.emit(WsServerEvent.NOTIFICATION_ACCEPTED_FRIEND, {
    senderId: input.senderId,
    recipientId: input.senderId,
    data: resultConversation,
  });

  return resultConversation;
}

export async function notificationDenyFriendController(input: {
  senderId: string;
  senderUsername: string;
  recipientId: string;
}) {
  eventBusServer.emit(WsServerEvent.NOTIFICATION_DENIED_FRIEND, {
    senderId: input.senderId,
    senderUsername: input.senderUsername,
    recipientId: input.recipientId,
  });

  return {
    status: 200,
    code: "DENIED",
    message: "Send denied notification is successful.",
  };
}

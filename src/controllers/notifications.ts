import { createConversationRepository } from "../repository";
import {
  ConversationType,
  WsServerEvent,
  type CreateConversationRepositoryOutput,
} from "../types/domain";
import { eventBusServer } from "../websocket/events";

export async function notificationAddFriendController(input: {
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
}) {
  eventBusServer.emit(WsServerEvent.NOTIFICATION_ADD_FRIEND, { input });

  return {
    status: 200,
    code: "ADDED_FRIEND",
    message: "Send add friend invitation is successful.",
  };
}

export async function notificationAcceptFriendController(input: {
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
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
    participantIds: [input.recipient.id, input.sender.id],
  });

  eventBusServer.emit(WsServerEvent.NOTIFICATION_ACCEPTED_FRIEND, {
    input,
  });

  return resultConversation;
}

export async function notificationDenyFriendController(input: {
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
}) {
  eventBusServer.emit(WsServerEvent.NOTIFICATION_DENIED_FRIEND, { input });

  return {
    status: 200,
    code: "DENIED",
    message: "Send denied notification is successful.",
  };
}

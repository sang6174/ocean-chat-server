import { WsServerEvent } from "../types/domain";
import type {
  CreateConversationRepositoryOutput,
  GetConversationByIdRepositoryOutput,
  PublishConversationCreated,
  PublishMessageCreated,
  PublishParticipantAdded,
  PublishNotificationFriendRequest,
  PublishNotificationAcceptedFriendRequest,
  PublishNotificationDeniedFriendRequest,
  Participant,
  SendFriendRequestRepositoryOutput,
  CancelFriendRequestRepositoryOutput,
  AcceptFriendRequestRepositoryOutput,
  DenyFriendRequestRepositoryOutput,
} from "../types/domain";
import type { DataWebSocket, WsDataToSendToClient } from "../types/ws";
import { eventBusServer } from "./events";
import { logger } from "../helpers/logger";
import { DomainError } from "../helpers/errors";
import { RequestContextAccessor } from "../helpers/contexts";

const wsConnections: Map<
  string,
  Set<Bun.ServerWebSocket<DataWebSocket>>
> = new Map();

// ============================================================
// Handle ws client open/close connection
// ============================================================
export function addWsConnection(ws: Bun.ServerWebSocket<DataWebSocket>) {
  if (!wsConnections.has(ws.data.userId)) {
    wsConnections.set(ws.data.userId, new Set());
  }

  wsConnections.get(ws.data.userId)!.add(ws);
  logger.info(`Client ${ws.data.userId} is connected.`);
  return;
}

export function removeWsConnection(ws: Bun.ServerWebSocket<DataWebSocket>) {
  if (!wsConnections.has(ws.data.userId)) {
    logger.warn(`Client ${ws.data.userId} is offline.`);
  }

  const conns = wsConnections.get(ws.data.userId);
  conns?.forEach((conn) => {
    if (ws.data.authToken === conn.data.authToken) {
      conns.delete(conn);
    }
  });

  if (conns?.size === 0) wsConnections.delete(ws.data.userId);
}

// ============================================================
// Broadcast & send to user
// ============================================================
export function broadcast<T>(
  recipients: {
    id: string;
    username: string;
  }[],
  data: T
) {
  recipients.forEach((recipient) => {
    const connections = wsConnections.get(recipient.id);
    if (!connections) {
      logger.warn(`User ${recipient.id} isn't online.`);
      return;
    }

    connections.forEach((conn) => {
      if (conn.readyState === WebSocket.OPEN) {
        try {
          conn.send(JSON.stringify(data));
        } catch (err: any) {
          throw new DomainError(err);
        }
      }
    });
  });
}

export function sendToUser<T>(recipientId: string, data: T) {
  const connections = wsConnections.get(recipientId);
  if (!connections) {
    logger.warn(`User ${recipientId} isn't online.`);
    return;
  }

  connections.forEach((conn) => {
    if (conn.readyState === WebSocket.OPEN) {
      try {
        conn.send(JSON.stringify(data));
        logger.info(`Message sent to user ${recipientId}`);
      } catch (e) {
        console.error(e);
      }
    }
  });
}

// ============================================================
// Handle Websocket server events
// ============================================================
eventBusServer.on(
  WsServerEvent.CONVERSATION_CREATED,
  (input: PublishConversationCreated) => {
    for (const recipient of input.recipients) {
      const dataToRecipient: WsDataToSendToClient<CreateConversationRepositoryOutput> =
        {
          type: WsServerEvent.CONVERSATION_CREATED,
          metadata: {
            senderId: input.sender.id,
            senderTabId: RequestContextAccessor.getTabId() ?? "",
            recipientId: recipient.id,
          },
          data: input.conversation,
        };
      sendToUser(recipient.id, dataToRecipient);
    }
    logger.info(
      `Published a new conversation, conversation id: ${input.conversation.conversation.id}`
    );
  }
);

eventBusServer.on(
  WsServerEvent.MESSAGE_CREATED,
  (input: PublishMessageCreated) => {
    // Broadcast a new message to conversation
    const data: WsDataToSendToClient<string> = {
      type: WsServerEvent.MESSAGE_CREATED,
      metadata: {
        senderId: input.sender.id,
        senderTabId: RequestContextAccessor.getTabId() ?? "",
        conversationId: input.message.conversationId,
      },
      data: input.message.content,
    };
    broadcast<WsDataToSendToClient<string>>(input.recipients, data);
    logger.info("Publish message created successfully.");
  }
);

eventBusServer.on(
  WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS,
  (input: PublishParticipantAdded) => {
    // Broadcast participant ids to old participants
    const dataToOldParticipants: WsDataToSendToClient<Participant[]> = {
      type: WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS,
      metadata: {
        senderId: input.sender.id,
        senderTabId: RequestContextAccessor.getTabId() ?? "",
        conversationId: input.conversation.conversation.id,
      },
      data: input.newParticipants,
    };

    const recipients = input.newParticipants.map((p) => {
      return {
        id: p.user.id,
        username: p.user.username,
      };
    });

    broadcast(recipients, dataToOldParticipants);

    // Send the new conversation to new participants
    const dataToNewParticipants: WsDataToSendToClient<GetConversationByIdRepositoryOutput> =
      {
        type: WsServerEvent.CONVERSATION_CREATED,
        metadata: {
          senderId: input.sender.id,
          senderTabId: RequestContextAccessor.getTabId() ?? "",
          conversationId: input.conversation.conversation.id,
        },
        data: input.conversation,
      };

    for (const recipient of input.newParticipants) {
      sendToUser(recipient.user.id, dataToNewParticipants);
    }
    logger.info("Publish conversation added participants successfully");
  }
);

eventBusServer.on(
  WsServerEvent.NOTIFICATION_FRIEND_REQUEST,
  (
    input: PublishNotificationFriendRequest<SendFriendRequestRepositoryOutput>
  ) => {
    const notification: WsDataToSendToClient<string> = {
      type: WsServerEvent.NOTIFICATION_FRIEND_REQUEST,
      metadata: {
        senderId: input.sender.id,
        senderTabId: RequestContextAccessor.getTabId() ?? "",
        recipientId: input.recipient.id,
      },
      data: input.data.content,
    };

    sendToUser(input.recipient.id, notification);
    logger.info("Publish friend quest notification successfully");
  }
);

eventBusServer.on(
  WsServerEvent.NOTIFICATION_CANCELLED_FRIEND_REQUEST,
  (
    input: PublishNotificationFriendRequest<CancelFriendRequestRepositoryOutput>
  ) => {
    const notification: WsDataToSendToClient<CancelFriendRequestRepositoryOutput> =
      {
        type: WsServerEvent.NOTIFICATION_CANCELLED_FRIEND_REQUEST,
        metadata: {
          senderId: input.sender.id,
          senderTabId: RequestContextAccessor.getTabId() ?? "",
          recipientId: input.recipient.id,
        },
        data: input.data,
      };

    sendToUser(input.recipient.id, notification);
    logger.info("Publish notification cancelled friend request successfully");
  }
);

eventBusServer.on(
  WsServerEvent.NOTIFICATION_ACCEPTED_FRIEND_REQUEST,
  (
    input: PublishNotificationAcceptedFriendRequest<AcceptFriendRequestRepositoryOutput>
  ) => {
    const notification: WsDataToSendToClient<AcceptFriendRequestRepositoryOutput> =
      {
        type: WsServerEvent.NOTIFICATION_ACCEPTED_FRIEND_REQUEST,
        metadata: {
          senderId: input.sender.id,
          senderTabId: RequestContextAccessor.getTabId() ?? "",
          recipientId: input.recipient.id,
        },
        data: input.data,
      };

    sendToUser(input.recipient.id, notification);
    logger.info("Publish notification accepted friend request successfully");
  }
);

eventBusServer.on(
  WsServerEvent.NOTIFICATION_DENIED_FRIEND_REQUEST,
  (
    input: PublishNotificationDeniedFriendRequest<DenyFriendRequestRepositoryOutput>
  ) => {
    const notification: WsDataToSendToClient<DenyFriendRequestRepositoryOutput> =
      {
        type: WsServerEvent.NOTIFICATION_DENIED_FRIEND_REQUEST,
        metadata: {
          senderId: input.sender.id,
          senderTabId: RequestContextAccessor.getTabId() ?? "",
          recipientId: input.recipient.id,
        },
        data: input.data,
      };

    sendToUser(input.recipient.id, notification);
    logger.info("Publish notification denied friend request successfully");
  }
);

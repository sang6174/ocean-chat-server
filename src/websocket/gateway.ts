import { WsServerEvent } from "../types/domain";
import type {
  CreateConversationRepositoryOutput,
  GetConversationRepositoryOutput,
  PublishConversationCreated,
  PublishMessageCreated,
  PublishParticipantAdded,
  PublishNotificationAddFriend,
  PublishNotificationAcceptedFriend,
  PublishNotificationDeniedFriend,
} from "../types/domain";
import type { DataWebSocket, WsDataToSendToClient } from "../types/ws";
import { eventBusServer } from "./events";
import { logger } from "../helpers/logger";

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
  console.log(`Client ${ws.data.userId} is connected.`);
  return;
}

export function removeWsConnection(ws: Bun.ServerWebSocket<DataWebSocket>) {
  if (!wsConnections.has(ws.data.userId)) {
    console.log(`Client ${ws.data.userId} is offline.`);
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
// Broadcast according to conversation
// ============================================================
export function broadcastToConversation<T>(
  authToken: string,
  recipientIds: string[],
  data: T
) {
  recipientIds.forEach((recipient) => {
    wsConnections.get(recipient)?.forEach((conn) => {
      if (authToken === conn.data.authToken) {
        return;
      }
      if (conn.readyState === WebSocket.OPEN) {
        try {
          conn.send(JSON.stringify(data));
        } catch (e) {
          console.error(e);
        }
      }
    });
  });
}

// ============================================================
// Send to user/the other sender online
// ============================================================
export function sendToOtherConnectionsOfSender<T>(
  recipientId: string,
  authToken: string,
  data: T
) {
  const connections = wsConnections.get(recipientId);
  if (!connections) {
    console.log(`User ${recipientId} isn't online.`);
    return;
  }

  connections.forEach((conn) => {
    if (
      conn.readyState === WebSocket.OPEN &&
      conn.data.authToken !== authToken
    ) {
      try {
        conn.send(JSON.stringify(data));
      } catch (e) {
        console.error(e);
      }
    }
  });
}

export function sendToUser<T>(recipientId: string, data: T) {
  const connections = wsConnections.get(recipientId);
  if (!connections) {
    console.log(`User ${recipientId} isn't online.`);
    return;
  }

  connections.forEach((conn) => {
    if (conn.readyState === WebSocket.OPEN) {
      try {
        conn.send(JSON.stringify(data));
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
    // Send payload to other connections of sender
    const dataToOtherConnectionsOfSender: WsDataToSendToClient<CreateConversationRepositoryOutput> =
    {
      type: WsServerEvent.CONVERSATION_CREATED,
      metadata: {
        senderId: input.senderId,
        toUserId: input.senderId,
      },
      data: input.conversation,
    };

    sendToOtherConnectionsOfSender(
      input.authToken,
      input.senderId,
      dataToOtherConnectionsOfSender
    );

    // Send payload to participants
    for (const recipientId of input.recipientIds) {
      const dataToRecipient: WsDataToSendToClient<CreateConversationRepositoryOutput> =
      {
        type: WsServerEvent.CONVERSATION_CREATED,
        metadata: {
          senderId: input.senderId,
          toUserId: recipientId,
        },
        data: input.conversation,
      };
      sendToUser(recipientId, dataToRecipient);
    }
    logger.info("Publish conversation created successfully");
  }
);

eventBusServer.on(
  WsServerEvent.MESSAGE_CREATED,
  (input: PublishMessageCreated) => {
    // Broadcast a new message to conversation
    const data: WsDataToSendToClient<string> = {
      type: WsServerEvent.MESSAGE_CREATED,
      metadata: {
        senderId: input.senderId,
        toConversationId: input.conversationId,
      },
      data: input.message,
    };
    broadcastToConversation<WsDataToSendToClient<string>>(
      input.authToken,
      input.recipientIds,
      data
    );
    logger.info("Publish message created successfully.");
  }
);

eventBusServer.on(
  WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS,
  (input: PublishParticipantAdded) => {
    // Broadcast participant ids to old participants
    const dataToOldParticipants: WsDataToSendToClient<string[]> = {
      type: WsServerEvent.MESSAGE_CREATED,
      metadata: {
        senderId: input.senderId,
        toConversationId: input.conversationId,
      },
      data: input.newParticipants,
    };
    console.log(dataToOldParticipants);
    broadcastToConversation(
      input.authToken,
      input.oldParticipants,
      dataToOldParticipants
    );

    // Send the new conversation to new participants
    const dataToNewParticipants: WsDataToSendToClient<GetConversationRepositoryOutput> =
    {
      type: WsServerEvent.MESSAGE_CREATED,
      metadata: {
        senderId: input.senderId,
        toConversationId: input.conversationId,
      },
      data: input.conversation,
    };

    for (const recipient of input.newParticipants) {
      sendToUser(recipient, dataToNewParticipants);
    }
    logger.info("Publish conversation added participants successfully");
  }
);

eventBusServer.on(
  WsServerEvent.NOTIFICATION_ADD_FRIEND,
  (input: PublishNotificationAddFriend) => {
    const notification: WsDataToSendToClient<string> = {
      type: WsServerEvent.NOTIFICATION_ADD_FRIEND,
      metadata: {
        senderId: input.sender.id,
        toUserId: input.recipient.id,
      },
      data: `${input.sender.username} send you a add friend invitation.`,
    };
    console.log(notification);
    sendToUser(input.recipient.id, notification);
    logger.info("Publish friend quest notification successfully");
  }
);

eventBusServer.on(
  WsServerEvent.NOTIFICATION_ACCEPTED_FRIEND,
  (
    input: PublishNotificationAcceptedFriend<CreateConversationRepositoryOutput>
  ) => {
    const notification: WsDataToSendToClient<CreateConversationRepositoryOutput> =
    {
      type: WsServerEvent.NOTIFICATION_ADD_FRIEND,
      metadata: {
        senderId: input.sender.id,
        toUserId: input.recipient.id,
      },
      data: input.data,
    };

    sendToUser(input.recipient.id, notification);
    logger.info("Publish notification accepted friend request successfully");
  }
);

eventBusServer.on(
  WsServerEvent.NOTIFICATION_DENIED_FRIEND,
  (input: PublishNotificationDeniedFriend) => {
    const notification: WsDataToSendToClient<string> = {
      type: WsServerEvent.NOTIFICATION_ADD_FRIEND,
      metadata: {
        senderId: input.sender.id,
        toUserId: input.recipient.id,
      },
      data: `${input.sender.username} denied your add friend invitation.`,
    };

    sendToUser(input.recipient.id, notification);
    logger.info("Publish notification denied friend request successfully");
  }
);

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
  ParticipantWithUsername,
} from "../types/domain";
import type { DataWebSocket, WsDataToSendToClient } from "../types/ws";
import { eventBusServer } from "./events";
import { logger } from "../helpers/logger";
import { DomainError } from "../helpers/errors";

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
// Broadcast according to conversation
// ============================================================
export function broadcastToConversation<T>(
  authToken: string,
  recipients: {
    id: string;
    username: string;
  }[],
  data: T
) {
  recipients.forEach((recipient) => {
    wsConnections.get(recipient.id)?.forEach((conn) => {
      if (authToken === conn.data.authToken) {
        return;
      }
      if (conn.readyState === WebSocket.OPEN) {
        try {
          logger.info(`Broadcast to conversation: sending data to ${recipient.id} via conn ${conn.data.userId}`);
          conn.send(JSON.stringify(data));
        } catch (err: any) {
          logger.error("Broadcast to conversation failed");
          throw new DomainError(err)
        }
      }
    });
  });
}

// ============================================================
// Send to user/the other sender online
// ============================================================
export function sendToOtherConnectionsOfSender<T>(
  authToken: string,
  recipientId: string,
  data: T
) {
  const connections = wsConnections.get(recipientId);
  if (!connections) {
    return;
  }

  connections.forEach((conn) => {
    if (
      conn.readyState === WebSocket.OPEN &&
      conn.data.authToken !== authToken
    ) {
      try {
        conn.send(JSON.stringify(data));
        logger.info(`Sent to other connection of sender ${recipientId}`);
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
    // Send payload to other connections of sender
    const dataToOtherConnectionsOfSender: WsDataToSendToClient<CreateConversationRepositoryOutput> =
    {
      type: WsServerEvent.CONVERSATION_CREATED,
      metadata: {
        senderId: input.sender.id,
        toUserId: input.sender.id,
      },
      data: input.conversation,
    };

    sendToOtherConnectionsOfSender(
      input.authToken,
      input.sender.id,
      dataToOtherConnectionsOfSender
    );

    // Send payload to participants
    for (const recipient of input.recipients) {
      const dataToRecipient: WsDataToSendToClient<CreateConversationRepositoryOutput> =
      {
        type: WsServerEvent.CONVERSATION_CREATED,
        metadata: {
          senderId: input.sender.id,
          toUserId: recipient.id,
        },
        data: input.conversation,
      };
      sendToUser(recipient.id, dataToRecipient);
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
        senderId: input.sender.id,
        toConversationId: input.conversationId,
      },
      data: input.message,
    };
    broadcastToConversation<WsDataToSendToClient<string>>(
      input.authToken,
      input.recipients,
      data
    );
    logger.info("Publish message created successfully.");
  }
);

eventBusServer.on(
  WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS,
  (input: PublishParticipantAdded) => {
    // Broadcast participant ids to old participants
    const dataToOldParticipants: WsDataToSendToClient<
      ParticipantWithUsername[]
    > = {
      type: WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS,
      metadata: {
        senderId: input.sender.id,
        toConversationId: input.conversationId,
      },
      data: input.newParticipants,
    };

    const recipients = input.newParticipants.map((p) => {
      return {
        id: p.userId,
        username: p.username,
      };
    });

    broadcastToConversation(input.authToken, recipients, dataToOldParticipants);

    // Send the new conversation to new participants
    const dataToNewParticipants: WsDataToSendToClient<GetConversationRepositoryOutput> =
    {
      type: WsServerEvent.CONVERSATION_CREATED,
      metadata: {
        senderId: input.sender.id,
        toConversationId: input.conversationId,
      },
      data: input.conversation,
    };

    for (const recipient of input.newParticipants) {
      sendToUser(recipient.userId, dataToNewParticipants);
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
      data: `${input.sender.username} send you a friend request.`,
    };

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
      type: WsServerEvent.NOTIFICATION_ACCEPTED_FRIEND,
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
      type: WsServerEvent.NOTIFICATION_DENIED_FRIEND,
      metadata: {
        senderId: input.sender.id,
        toUserId: input.recipient.id,
      },
      data: `${input.sender.username} denied your friend request.`,
    };

    sendToUser(input.recipient.id, notification);
    logger.info("Publish notification denied friend request successfully");
  }
);

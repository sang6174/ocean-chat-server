import { WsServerEvent } from "../types/domain";
import type {
  CreateConversationRepositoryOutput,
  GetConversationRepositoryOutput,
  PublishConversationCreated,
  PublishMessageCreated,
  PublishParticipantAdded,
  PublishNotificationAddFriend,
  PublishNotificationAddedFriend,
  PublishNotificationDeniedFriend,
} from "../types/domain";
import type { DataWebSocket, WsDataToSendToClient } from "../types/ws";
import { eventBusServer } from "./events";

const wsConnections: Map<
  string,
  Set<Bun.ServerWebSocket<DataWebSocket>>
> = new Map();

// Handle ws client open/close connection
export function addWsConnection(ws: Bun.ServerWebSocket<DataWebSocket>) {
  if (!wsConnections.has(ws.data.userId)) {
    wsConnections.set(ws.data.userId, new Set());
  }

  wsConnections.get(ws.data.userId)!.add(ws);
  console.log(`Client ${ws.data.userId} is connected.`);
  ws.send(`Client ${ws.data.userId} is connected.`);
  return;
}

export function removeWsConnection(ws: Bun.ServerWebSocket<DataWebSocket>) {
  if (!wsConnections.has(ws.data.userId)) {
    console.log(`Client ${ws.data.userId} is offline.`);
  }

  const conns = wsConnections.get(ws.data.userId);
  conns?.forEach((conn) => {
    if (ws.data.accessToken === conn.data.accessToken) {
      conns.delete(conn);
    }
  });

  if (conns?.size === 0) wsConnections.delete(ws.data.userId);
}

// Broadcast according to conversation
export function broadcastToConversation<T>(
  accessToken: string,
  recipientIds: string[],
  data: T
) {
  recipientIds.forEach((recipient) => {
    wsConnections.get(recipient)?.forEach((conn) => {
      if (accessToken === conn.data.accessToken) return;
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

// Send according to user
export function sendToOtherConnectionsOfSender<T>(
  recipientId: string,
  accessToken: string,
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
      conn.data.accessToken !== accessToken
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

// Handle Websocket server events
eventBusServer.on(
  WsServerEvent.CONVERSATION_CREATED,
  ({
    senderId,
    accessToken,
    recipientIds,
    conversation,
  }: PublishConversationCreated) => {
    // Send payload to other connections of sender
    const dataToOtherConnectionsOfSender: WsDataToSendToClient<CreateConversationRepositoryOutput> =
      {
        type: WsServerEvent.CONVERSATION_CREATED,
        metadata: {
          senderId,
          toUserId: senderId,
        },
        data: conversation,
      };

    sendToOtherConnectionsOfSender(
      accessToken,
      senderId,
      dataToOtherConnectionsOfSender
    );

    // Send payload to participants
    for (const recipientId of recipientIds) {
      const dataToRecipient: WsDataToSendToClient<CreateConversationRepositoryOutput> =
        {
          type: WsServerEvent.CONVERSATION_CREATED,
          metadata: {
            senderId,
            toUserId: recipientId,
          },
          data: conversation,
        };
      sendToUser(recipientId, dataToRecipient);
    }
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
        toConversation: input.conversationIdentifier,
      },
      data: input.message,
    };
    broadcastToConversation<WsDataToSendToClient<string>>(
      input.accessToken,
      input.recipientIds,
      data
    );
  }
);

eventBusServer.on(
  WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS,
  ({
    senderId,
    accessToken,
    oldParticipants,
    newParticipants,
    conversationIdentifier,
    conversation,
  }: PublishParticipantAdded) => {
    // Broadcast participant ids to old participants
    const dataToOldParticipants: WsDataToSendToClient<string[]> = {
      type: WsServerEvent.MESSAGE_CREATED,
      metadata: {
        senderId,
        toConversation: conversationIdentifier,
      },
      data: newParticipants,
    };
    console.log(dataToOldParticipants);
    broadcastToConversation(
      accessToken,
      oldParticipants,
      dataToOldParticipants
    );

    // Send the new conversation to new participants
    const dataToNewParticipants: WsDataToSendToClient<GetConversationRepositoryOutput> =
      {
        type: WsServerEvent.MESSAGE_CREATED,
        metadata: {
          senderId,
          toConversation: conversationIdentifier,
        },
        data: conversation,
      };

    for (const recipient of newParticipants) {
      sendToUser(recipient, dataToNewParticipants);
    }
  }
);

eventBusServer.on(
  WsServerEvent.NOTIFICATION_ADD_FRIEND,
  ({ senderId, senderUsername, recipientId }: PublishNotificationAddFriend) => {
    const notification: WsDataToSendToClient<string> = {
      type: WsServerEvent.NOTIFICATION_ADD_FRIEND,
      metadata: {
        senderId,
        toUserId: recipientId,
      },
      data: `${senderUsername} send you a add friend invitation.`,
    };
    console.log(notification);
    sendToUser(recipientId, notification);
  }
);

eventBusServer.on(
  WsServerEvent.NOTIFICATION_ACCEPTED_FRIEND,
  ({
    senderId,
    recipientId,
    data,
  }: PublishNotificationAddedFriend<CreateConversationRepositoryOutput>) => {
    const notification: WsDataToSendToClient<CreateConversationRepositoryOutput> =
      {
        type: WsServerEvent.NOTIFICATION_ADD_FRIEND,
        metadata: {
          senderId,
          toUserId: recipientId,
        },
        data,
      };

    sendToUser(recipientId, notification);
  }
);

eventBusServer.on(
  WsServerEvent.NOTIFICATION_DENIED_FRIEND,
  ({
    senderId,
    senderUsername,
    recipientId,
  }: PublishNotificationDeniedFriend) => {
    const notification: WsDataToSendToClient<string> = {
      type: WsServerEvent.NOTIFICATION_ADD_FRIEND,
      metadata: {
        senderId,
        toUserId: recipientId,
      },
      data: `${senderUsername} denied your add friend invitation.`,
    };

    sendToUser(recipientId, notification);
  }
);

import { WsServerEvent } from "../types";
import type {
  Conversation,
  ConversationIdentifier,
  DataWebSocket,
  WsNormalOutput,
} from "../types";
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
  }: {
    senderId: string;
    accessToken: string;
    recipientIds: string[];
    conversation: Conversation;
  }) => {
    const data: WsNormalOutput = {
      type: WsServerEvent.CONVERSATION_CREATED,
      payload: {
        metadata: {
          senderId,
          toUserId: senderId,
        },
        data: conversation,
      },
    };
    sendToOtherConnectionsOfSender(accessToken, senderId, data);
    for (const recipientId of recipientIds) {
      sendToUser(recipientId, data);
    }
  }
);

eventBusServer.on(
  WsServerEvent.MESSAGE_CREATED,
  ({
    senderId,
    accessToken,
    conversationIdentifier,
    recipientIds,
    message,
  }: {
    senderId: string;
    accessToken: string;
    conversationIdentifier: ConversationIdentifier;
    recipientIds: string[];
    message: string;
  }) => {
    const data: WsNormalOutput = {
      type: WsServerEvent.MESSAGE_CREATED,
      payload: {
        metadata: {
          senderId,
          toConversation: conversationIdentifier,
        },
        data: message,
      },
    };
    broadcastToConversation<WsNormalOutput>(accessToken, recipientIds, data);
  }
);

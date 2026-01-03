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
  AddParticipantsRepositoryOutput,
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
    // 1. Combine old and new participants to get the full list of recipients
    const allRecipients = [
      ...input.oldParticipants.map(p => ({ id: p.user.id, username: p.user.username })),
      ...input.newParticipants.participants.map(p => ({ id: p.user.id, username: p.user.username }))
    ];

    // 2. Broadcast the 'added participants' event to ALL members
    // This helps existing members update their participant list UI
    const dataToAllParticipants: WsDataToSendToClient<AddParticipantsRepositoryOutput> =
    {
      type: WsServerEvent.CONVERSATION_ADDED_PARTICIPANTS,
      metadata: {
        senderId: input.sender.id,
        senderTabId: RequestContextAccessor.getTabId() ?? "",
        conversationId: input.conversation.conversation.id,
      },
      data: input.newParticipants,
    };

    broadcast(allRecipients, dataToAllParticipants);

    // 3. Broadcast individual MESSAGE_CREATED events for each system message
    // This ensures real-time system messages appear in the chat window for everyone
    for (const message of input.newParticipants.messages) {
      const messageData: WsDataToSendToClient<string> = {
        type: WsServerEvent.MESSAGE_CREATED,
        metadata: {
          senderId: "", // System message indicator
          senderTabId: RequestContextAccessor.getTabId() ?? "",
          conversationId: input.conversation.conversation.id,
        },
        data: message.content,
      };
      broadcast(allRecipients, messageData);
    }

    // 4. Send the full conversation object ONLY to new participants
    // This ensures they get the chat added to their sidebar
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

    for (const recipient of input.newParticipants.participants) {
      sendToUser(recipient.user.id, dataToNewParticipants);
    }

    logger.info("Publish conversation added participants and system messages successfully");
  }
);

eventBusServer.on(
  WsServerEvent.NOTIFICATION_FRIEND_REQUEST,
  (
    input: PublishNotificationFriendRequest<SendFriendRequestRepositoryOutput>
  ) => {
    const notification: WsDataToSendToClient<SendFriendRequestRepositoryOutput> = {
      type: WsServerEvent.NOTIFICATION_FRIEND_REQUEST,
      metadata: {
        senderId: input.sender.id,
        senderTabId: RequestContextAccessor.getTabId() ?? "",
        recipientId: input.recipient.id,
      },
      data: input.data,
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

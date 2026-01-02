export interface DataWebSocket {
  userId: string;
  username: string;
  authToken: string;
  conversationIds: string[];
}

export type WsToUser = {
  senderId: string;
  senderTabId: string;
  recipientId: string;
};

export type WsToConversation = {
  senderId: string;
  senderTabId: string;
  conversationId: string;
};

export interface WsDataToSendToClient<T> {
  type: string;
  metadata: WsToUser | WsToConversation;
  data: T;
}

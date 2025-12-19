export interface DataWebSocket {
  userId: string;
  username: string;
  authToken: string;
  conversationIds: string[];
}

export type WsToUser = {
  senderId: string;
  toUserId: string;
};

export type WsToConversation = {
  senderId: string;
  toConversationId: string;
};

export interface WsDataToSendToClient<T> {
  type: string;
  metadata: WsToUser | WsToConversation;
  data: T;
}

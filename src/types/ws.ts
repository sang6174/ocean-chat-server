import type { ConversationIdentifier } from "./domain";

export interface DataWebSocket {
  userId: string;
  username: string;
  accessToken: string;
  conversation: ConversationIdentifier[];
}

export type WsToUser = {
  senderId: string;
  toUserId: string;
};

export type WsToConversation = {
  senderId: string;
  toConversation: ConversationIdentifier;
};

export interface WsDataToSendToClient<T> {
  type: string;
  metadata: WsToUser | WsToConversation;
  data: T;
}

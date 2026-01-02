// ============================================================
// HTTP Input
// ============================================================
export interface HttpRegisterPost {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface HttpLoginPost {
  username: string;
  password: string;
}

export interface HttpLoginPostResponse {
  userId: string;
  username: string;
  email: string;
  accessToken: string;
}

export interface HttpCreateGroupConversationPost {
  conversation: {
    name: string;
  };
  participantIds: string[];
}

export interface HttpSendMessagePost {
  conversationId: string;
  message: string;
}

export interface HttpAddParticipantsPost {
  conversationId: string;
  participantIds: string[];
}

export interface HttpFriendRequest {
  recipient: {
    id: string;
    username: string;
  };
}

export interface HttpFriendRequestWithNotificationId {
  recipient: {
    id: string;
    username: string;
  };
  notificationId: string;
}

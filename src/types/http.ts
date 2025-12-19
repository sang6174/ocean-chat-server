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
  authToken: string;
}

export interface HttpCreateConversationPost {
  conversation: {
    type: string;
    metadata: {
      name: string;
    };
  };
  participantIds: string[];
}

export interface HttpSendMessagePost {
  conversationId: string;
  sender: {
    id: string;
    username: string;
  };
  message: string;
}

export interface HttpAddParticipantPost {
  conversationId: string;
  creator: {
    id: string;
    username: string;
  };
  participantIds: string[];
}

export interface HttpNotificationFriendPost {
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
}

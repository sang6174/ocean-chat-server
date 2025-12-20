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
  participants: {
    id: string;
    username: string;
  }[];
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
  participants: {
    id: string;
    username: string;
  }[];
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

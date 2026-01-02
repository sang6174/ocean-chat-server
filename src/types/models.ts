// ============================================================
// PostgreSQL Tables
// ============================================================
export type PgUser = {
  id: string;
  name: string;
  email: string;
};

export type PgAccount = {
  id: string;
  username: string;
  password: string;
  user_id: string;
};

export type PgConversation = {
  id: string;
  type: string;
  name: string;
  last_event: Date;
  creator_id: string;
};

export type PgParticipant = {
  conversation_id: string;
  user_id: string;
  role: string;
  last_seen: Date;
  joined_at: Date;
};

export type PgMessage = {
  id: string;
  content: string;
  sender_id: string | null;
  conversation_id: string;
};

export type PgNotification = {
  id: string;
  type: string;
  status: string;
  content: string;
  sender_id: string;
  recipient_id: string;
};

export interface PgRegisterOutput {
  user: PgUser;
  account: PgAccount;
  conversation: PgConversation;
  participant: PgParticipant;
  messages: (PgMessage & { sender_username: string })[];
}

export interface PgCreateConversationOutput {
  conversation: PgConversation;
  participants: (Omit<PgParticipant, "conversation_id"> & {
    username: string;
  })[];
  messages: Omit<PgMessage, "conversation_id">[];
}

export interface PgAddParticipantsOutput {
  participants: (Omit<PgParticipant, "conversation_id"> & {
    username: string;
  })[];
  messages: PgMessage[];
}

export type PgGetProfileUserOutput = PgUser & { username: string };

export interface PgCreateMessageOutput {
  message: PgMessage;
  participants: (Omit<PgParticipant, "conversation_id"> & {
    username: string;
  })[];
}

export interface PgGetConversationByIdOutput {
  conversation: PgConversation;
  participants: (Omit<PgParticipant, "conversation_id"> & {
    username: string;
  })[];
  messages: (Omit<PgMessage, "conversation_id"> & {
    isDeleted: boolean;
  })[];
}

export interface PgGetMessagesOutput {
  id: string;
  content: string;
  sender_id: string;
  sender_username: string;
  conversation_id: string;
  is_deleted: boolean;
}

export interface PgSendFriendRequestOutput {
  id: string;
  type: string;
  status: string;
  content: string;
  sender_id: string;
  recipient_id: string;
}

export interface PgGetNotificationOutput {
  id: string;
  type: string;
  status: string;
  content: string;
  sender_id: string;
  recipient_id: string;
}

export interface PgCancelFriendRequestOutput {
  id: string;
  type: string;
  status: string;
  content: string;
  sender_id: string;
  recipient_id: string;
}

export interface PgAcceptFriendRequestOutput {
  conversation: PgConversation;
  participants: (Omit<PgParticipant, "conversation_id"> & {
    username: string;
  })[];
  messages: Omit<PgMessage, "conversation_id">[];
  notification: {
    id: string;
    type: string;
    status: string;
    content: string;
    sender_id: string;
    recipient_id: string;
  };
}

export interface PgDenyFriendRequestOutput {
  id: string;
  type: string;
  status: string;
  content: string;
  sender_id: string;
  recipient_id: string;
}

export interface PgGetParticipantIdsOutput {
  user_id: string;
}

export interface PgGetConversationIdsOutput {
  id: string;
}

export interface PgGetParticipantRoleOutput {
  role: string;
}

export interface PgParticipantWithUsername {
  user_id: string;
  username: string;
  role: string;
  joined_at: Date;
  last_seen: Date;
}

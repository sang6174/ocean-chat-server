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
};

export type PgAccountNoPassword = Omit<PgAccount, "password">;

export type PgConversation = {
  id: string;
  type: string;
  metadata: Record<string, any>;
};

export type PgParticipant = {
  user_id: string;
  conversation_id: string;
  role: string;
  last_seen: Date;
  joined_at: Date;
};

export type PgParticipantNoConversationId = Omit<
  PgParticipant,
  "conversation_id"
>;

export type PgMessage = {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
};

export type PgMessageWithUsername = Omit<PgMessage, "conversation_id"> & {
  sender_username: string;
};

// ============================================================
// Database Error
// ============================================================
export const DB_ERROR_CODE = {
  SYNTAX: "syntax",
  PROGRAM_LIMIT_EXCEEDED: "program_limit_exceeded",
  FOREIGN_KEY: "FOREIGN_KEY",
  NOT_NULL: "NOT_NULL",
  INVALID_INPUT: "INVALID_INPUT",
  CHECK_CONSTRAINT: "CHECK_CONSTRAINT",
  PERMISSION: "PERMISSION",
  CONNECTION: "CONNECTION",
  UNKNOWN: "UNKNOWN",
} as const;

export type DbErrorCode = (typeof DB_ERROR_CODE)[keyof typeof DB_ERROR_CODE];

export interface DbErrorResponse {
  type: DbErrorCode;
  response: {
    status: number;
    message: string;
  };
}

// ============================================================
// Transaction Input/Output
// ============================================================

export interface PgRegisterTransactionInput {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface PgRegisterTransactionOutput {
  user: PgUser;
  account: PgAccount;
  conversation: PgConversation;
}

//
export interface PgCreateConversationTransactionInput {
  type: string;
  metadata: Record<string, any>;
  participantIds: string[];
}

export interface PgCreateConversationTransactionOutput {
  conversation: PgConversation;
  participants: PgParticipant[];
}

export interface PgAddParticipantsTransactionInput {
  conversationId: string;
  participantIds: string[];
}

export interface PgGetConversationInput {
  conversationId: string;
  limit?: number;
  offset?: number;
}

export interface PgGetConversationIdsOutput {
  ids: string[];
}

export interface PgGetConversationOutput {
  conversation: PgConversation;
  participants: PgParticipantNoConversationId[];
  messages: PgMessageWithUsername[];
}

// ============================================================
// CRUD Input/Output
// ============================================================

export interface PgCreateMessageInput {
  conversationId: string;
  senderId: string;
  content: string;
}

export interface PgFindUserByEmailInput {
  email: string;
}

export interface PgFindAccountByUsernameInput {
  username: string;
}

export interface PgFindAccountById {
  id: string;
}

export interface PgGetParticipantRoleInput {
  userId: string;
  conversationId: string;
}

export interface PgGetParticipantRoleOutput {
  role: string;
}

export interface PgGetConversationIdentifiersInput {
  userId: string;
}

export interface PgGetMessagesInput {
  conversationId: string;
  limit: number;
  offset: number;
}

export interface PgGetParticipantIdsOutput {
  user_id: string;
}

export interface PgGetProfileUserInput {
  userId: string;
}

export interface PgGetProfileUserOutput extends PgUser {
  username: string;
}

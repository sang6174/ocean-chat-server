import { pool } from "../configs/db";

import type {
  PgUser,
  PgAccount,
  PgConversationIdentifier,
  PgMessage,
  PgMessageWithUsername,
  PgCreateMessageInput,
  PgFindUserByEmailInput,
  PgFindAccountByUsernameInput,
  PgFindAccountById,
  PgGetParticipantRoleInput,
  PgGetConversationIdentifiersInput,
  PgGetMessagesInput,
  PgGetParticipantIdsOutput,
  PgGetParticipantRoleOutput,
  PgGetInfoUserInput,
  PgGetInfoUserOutput,
} from "../types/models";

// ============================================================
// Create
// ============================================================
export async function pgCreateMessage({
  conversationId,
  senderId,
  content,
}: PgCreateMessageInput): Promise<PgMessage | null> {
  try {
    const message = await pool.query(
      `INSERT INTO main.messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3) 
       RETURNING id, sender_id, conversation_id, content`,
      [conversationId, senderId, content]
    );

    return message.rows[0];
  } catch (err) {
    console.error(
      `[POSTGRES_ERROR] - ${new Date().toISOString()} - Create a new message error.\n`,
      err
    );
    return null;
  }
}

// ============================================================
// Read
// ============================================================
export async function pgFindUserByEmail({
  email,
}: PgFindUserByEmailInput): Promise<PgUser | null> {
  try {
    const result = await pool.query(
      `SELECT id, name, email FROM main.users WHERE email = $1 AND is_deleted = false`,
      [email]
    );
    return result.rows[0];
  } catch (err) {
    console.error(
      `[POSTGRES_ERROR] - ${new Date().toISOString()} - Get user by email error.\n`,
      err
    );
    return null;
  }
}

export async function pgFindAccountByUsername({
  username,
}: PgFindAccountByUsernameInput): Promise<PgAccount | null> {
  try {
    const result = await pool.query(
      `SELECT id, username, password FROM main.accounts WHERE username = $1 AND is_deleted = false`,
      [username]
    );
    return result.rows[0];
  } catch (err) {
    console.error(
      `[POSTGRES_ERROR] - ${new Date().toISOString()} - Get account by username error.\n`,
      err
    );
    return null;
  }
}

export async function pgFindAccountById({
  id,
}: PgFindAccountById): Promise<PgAccount | null> {
  try {
    const result = await pool.query(
      `SELECT id, username, password FROM main.accounts WHERE id = $1 AND is_deleted = false`,
      [id]
    );
    return result.rows[0];
  } catch (err) {
    console.error(
      `[POSTGRES_ERROR] - ${new Date().toISOString()} - Get account by id error.\n`,
      err
    );
    return null;
  }
}

export async function pgGetInfoUsers(): Promise<PgGetInfoUserOutput[] | null> {
  try {
    const result = await pool.query(
      `SELECT u.id, a.username, u.name, u.email 
       FROM main.users u 
       JOIN main.accounts a ON u.id = a.id
      `
    );
    return result.rows;
  } catch (err) {
    console.error(
      `[POSTGRES_ERROR] - ${new Date().toISOString()} -Get all users in database error.\n`,
      err
    );
    return null;
  }
}

export async function pgGetInfoUser({
  userId,
}: PgGetInfoUserInput): Promise<PgGetInfoUserOutput | null> {
  try {
    const result = await pool.query(
      `SELECT u.id, a.username, u.name, u.email 
       FROM main.users u 
       JOIN main.accounts a ON u.id = a.id
       WHERE 
      `,
      [userId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(
      `[POSTGRES_ERROR] - ${new Date().toISOString()} -Get all users in database error.\n`,
      err
    );
    return null;
  }
}

export async function pgGetParticipantRole({
  userId,
  conversationId,
}: PgGetParticipantRoleInput): Promise<PgGetParticipantRoleOutput | null> {
  try {
    const result = await pool.query(
      `SELECT role
       FROM main.participants
       WHERE user_id = $1 AND conversation_Id = $2`,
      [userId, conversationId]
    );

    return result.rows[0];
  } catch (err) {
    console.error(
      `[POSTGRES_ERROR] - ${new Date().toISOString()} - Get role of a user in a conversation error.\n`,
      err
    );
    return null;
  }
}

export async function pgGetConversationIdentifiers({
  userId,
}: PgGetConversationIdentifiersInput): Promise<
  PgConversationIdentifier[] | null
> {
  try {
    const conversationIdentifiers = await pool.query(
      `SELECT c.id, c.type 
       FROM main.participants p 
       JOIN main.conversations c ON p.conversation_id = c.id 
       WHERE p.user_id = $1`,
      [userId]
    );

    return conversationIdentifiers.rows;
  } catch (err) {
    console.error(
      `[POSTGRES_ERROR] - ${new Date().toISOString()} - Get all conversation identifiers of a user.\n`,
      err
    );
    return null;
  }
}

export async function pgGetParticipantIds(
  conversationId: string
): Promise<PgGetParticipantIdsOutput[] | null> {
  try {
    const participantIds = await pool.query(
      `SELECT user_id
       FROM main.participants
       WHERE conversation_id = $1`,
      [conversationId]
    );

    return participantIds.rows;
  } catch (err) {
    console.error(
      `[POSTGRES_ERROR] - ${new Date().toISOString()} - Get ids of participants error.\n`,
      err
    );
    return null;
  }
}

export async function pgGetMessages({
  conversationId,
  limit = 10,
  offset = 0,
}: PgGetMessagesInput): Promise<PgMessageWithUsername[] | null> {
  try {
    const result = await pool.query(
      `SELECT m.id, m.content, m.sender_id, a.username as sender_username, m.conversation_id
       FROM main.messages m 
       JOIN main.accounts a ON a.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );

    return result.rows;
  } catch (err) {
    console.error(
      `[POSTGRES_ERROR] - ${new Date().toISOString()} - Get messages with limit, offset error.\n`,
      err
    );
    return null;
  }
}

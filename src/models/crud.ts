import { pool } from "../configs/db";
import type {
  CreateMessageRepositoryInput,
  FindUserByEmailRepositoryInput,
  FindAccountByUsernameRepositoryInput,
  FindAccountByIdRepositoryInput,
  GetInfoUserRepositoryInput,
  GetParticipantRoleRepositoryInput,
  GetParticipantIdsRepositoryInput,
} from "../types/domain";
import type { BaseLogger } from "../types/logger";
import type {
  PgUser,
  PgAccount,
  PgMessage,
  PgMessageWithUsername,
  PgConversationIdentifier,
  PgGetProfileUserOutput,
  PgGetMessagesInput,
  PgGetConversationIdentifiersInput,
  PgGetParticipantIdsOutput,
  PgGetParticipantRoleOutput,
} from "../types/models";

// ============================================================
// Create
// ============================================================
export async function pgCreateMessage(
  baseLogger: BaseLogger,
  input: CreateMessageRepositoryInput
): Promise<PgMessage | null> {
  try {
    const message = await pool.query(
      `INSERT INTO main.messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3) 
       RETURNING id, sender_id, conversation_id, content`,
      [input.conversationId, input.senderId, input.content]
    );

    return message.rows[0];
  } catch (err) {
    return null;
  }
}

// ============================================================
// Read
// ============================================================
export async function pgFindUserByEmail(
  baseLogger: BaseLogger,
  input: FindUserByEmailRepositoryInput
): Promise<PgUser | null> {
  try {
    const result = await pool.query(
      `SELECT id, name, email FROM main.users WHERE email = $1 AND is_deleted = false`,
      [input.email]
    );
    return result.rows[0];
  } catch (err) {
    return null;
  }
}

export async function pgFindAccountByUsername(
  baseLogger: BaseLogger,
  input: FindAccountByUsernameRepositoryInput
): Promise<PgAccount | null> {
  try {
    const result = await pool.query(
      `SELECT id, username, password FROM main.accounts WHERE username = $1 AND is_deleted = false`,
      [input.username]
    );
    return result.rows[0];
  } catch (err) {
    return null;
  }
}

export async function pgFindAccountById(
  baseLogger: BaseLogger,
  input: FindAccountByIdRepositoryInput
): Promise<PgAccount | null> {
  try {
    const result = await pool.query(
      `SELECT id, username, password FROM main.accounts WHERE id = $1 AND is_deleted = false`,
      [input.id]
    );
    return result.rows[0];
  } catch (err) {
    return null;
  }
}

export async function pgGetAllProfileUsers(): Promise<
  PgGetProfileUserOutput[] | null
> {
  try {
    const result = await pool.query(
      `SELECT u.id, a.username, u.name, u.email 
       FROM main.users u 
       JOIN main.accounts a ON u.id = a.id
      `
    );
    return result.rows;
  } catch (err) {
    return null;
  }
}

export async function pgGetProfileUser(
  baseLogger: BaseLogger,
  input: GetInfoUserRepositoryInput
): Promise<PgGetProfileUserOutput | null> {
  try {
    const result = await pool.query(
      `SELECT u.id, a.username, u.name, u.email 
       FROM main.users u 
       JOIN main.accounts a ON u.id = a.id
       WHERE u.id = $1
      `,
      [input.userId]
    );
    return result.rows[0];
  } catch (err) {
    return null;
  }
}

export async function pgGetParticipantRole(
  baseLogger: BaseLogger,
  input: GetParticipantRoleRepositoryInput
): Promise<PgGetParticipantRoleOutput | null> {
  try {
    const result = await pool.query(
      `SELECT role
       FROM main.participants
       WHERE user_id = $1 AND conversation_Id = $2`,
      [input.userId, input.conversationId]
    );

    return result.rows[0];
  } catch (err) {
    return null;
  }
}

export async function pgGetConversationIdentifiers(
  baseLogger: BaseLogger,
  input: PgGetConversationIdentifiersInput
): Promise<PgConversationIdentifier[] | null> {
  try {
    const conversationIdentifiers = await pool.query(
      `SELECT c.id, c.type 
       FROM main.participants p 
       JOIN main.conversations c ON p.conversation_id = c.id 
       WHERE p.user_id = $1`,
      [input.userId]
    );

    return conversationIdentifiers.rows;
  } catch (err) {
    return null;
  }
}

export async function pgGetParticipantIds(
  baseLogger: BaseLogger,
  input: GetParticipantIdsRepositoryInput
): Promise<PgGetParticipantIdsOutput[] | null> {
  try {
    const participantIds = await pool.query(
      `SELECT user_id
       FROM main.participants
       WHERE conversation_id = $1`,
      [input.conversationId]
    );

    return participantIds.rows;
  } catch (err) {
    return null;
  }
}

export async function pgGetMessages(
  baseLogger: BaseLogger,
  input: PgGetMessagesInput
): Promise<PgMessageWithUsername[] | null> {
  try {
    const result = await pool.query(
      `SELECT m.id, m.content, m.sender_id, a.username as sender_username, m.conversation_id
       FROM main.messages m 
       JOIN main.accounts a ON a.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [input.conversationId, input.limit, input.offset]
    );

    return result.rows;
  } catch (err) {
    return null;
  }
}

// ============================================================
// UPDATE
// ============================================================

// ============================================================
// DELETE
// ============================================================

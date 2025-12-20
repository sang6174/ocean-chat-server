import { pool } from "../configs/db";
import type {
  CreateMessageRepositoryInput,
  FindAccountByUsernameRepositoryInput,
  FindAccountByIdRepositoryInput,
  GetProfileUserRepositoryInput,
  GetParticipantRoleRepositoryInput,
  GetParticipantIdsRepositoryInput,
  GetConversationIdsRepositoryInput,
  GetConversationRepositoryInput,
} from "../types/domain";
import type {
  PgAccount,
  PgMessage,
  PgMessageWithUsername,
  PgGetProfileUserOutput,
  PgGetMessagesInput,
  PgGetParticipantIdsOutput,
  PgGetParticipantRoleOutput,
  PgGetConversationIdsOutput,
  PgGetConversationOutput,
  PgParticipantWithUsername,
} from "../types/models";
import { mapPgError } from "../helpers/errors";

// ============================================================
// Create
// ============================================================
export async function pgCreateMessage(
  input: CreateMessageRepositoryInput
): Promise<PgMessage> {
  try {
    const message = await pool.query(
      `INSERT INTO main.messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3) 
       RETURNING id, sender_id, conversation_id, content`,
      [input.conversationId, input.senderId, input.content]
    );

    return message.rows[0];
  } catch (err: any) {
    throw mapPgError(err);
  }
}

// ============================================================
// Read
// ============================================================
export async function pgFindAccountByUsername(
  input: FindAccountByUsernameRepositoryInput
): Promise<PgAccount | null> {
  try {
    const result = await pool.query(
      `SELECT id, username, password FROM main.accounts WHERE username = $1 AND is_deleted = false`,
      [input.username]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  } catch (err: any) {
    throw mapPgError(err);
  }
}

export async function pgFindAccountById(
  input: FindAccountByIdRepositoryInput
): Promise<PgAccount | null> {
  try {
    const result = await pool.query(
      `SELECT id, username, password FROM main.accounts WHERE id = $1 AND is_deleted = false`,
      [input.id]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  } catch (err: any) {
    return err;
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

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows;
  } catch (err: any) {
    throw mapPgError(err);
  }
}

export async function pgGetProfileUser(
  input: GetProfileUserRepositoryInput
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

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  } catch (err: any) {
    throw mapPgError(err);
  }
}

export async function pgGetConversationIds(
  input: GetConversationIdsRepositoryInput
): Promise<PgGetConversationIdsOutput[] | null> {
  try {
    const result = await pool.query(
      `SELECT DISTINCT c.id 
       FROM main.participants p 
       JOIN main.conversations c ON p.conversation_id = c.id 
       WHERE p.user_id = $1`,
      [input.userId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows;
  } catch (err: any) {
    throw mapPgError(err);
  }
}

export async function pgGetConversation(
  input: GetConversationRepositoryInput
): Promise<PgGetConversationOutput | null> {
  try {
    console.log(input);
    const [conversation, participants, messages] = await Promise.all([
      pool.query(
        `SELECT id, type, metadata FROM main.conversations WHERE id = $1`,
        [input.conversationId]
      ),
      pool.query(
        `SELECT p.user_id, a.username, p.role, p.last_seen, p.joined_at 
         FROM main.participants p
         JOIN main.accounts a
         ON a.id = p.user_id
         WHERE conversation_id = $1`,
        [input.conversationId]
      ),
      pool.query(
        `SELECT m.id, m.content, m.sender_id, a.username as sender_username
         FROM main.messages m 
         JOIN main.accounts a ON a.id = m.sender_id
         WHERE m.conversation_id = $1
         ORDER BY m.created_at DESC
         LIMIT $2 OFFSET $3`,
        [input.conversationId, input.limit, input.offset]
      ),
    ]);

    if (conversation.rowCount === 0 || participants.rowCount === 0) {
      return null;
    }

    return {
      conversation: conversation.rows[0],
      participants: participants.rows,
      messages: messages.rows.reverse(),
    };
  } catch (err: any) {
    throw mapPgError(err);
  }
}

export async function pgGetParticipantRole(
  input: GetParticipantRoleRepositoryInput
): Promise<PgGetParticipantRoleOutput | null> {
  try {
    const result = await pool.query(
      `SELECT role
       FROM main.participants
       WHERE user_id = $1 AND conversation_Id = $2`,
      [input.userId, input.conversationId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  } catch (err: any) {
    throw mapPgError(err);
  }
}

export async function pgGetParticipantWithUsername(input: {
  conversationId: string;
}): Promise<PgParticipantWithUsername[] | null> {
  try {
    const result = await pool.query(
      `SELECT a.id, a.username, p.role, p.joined_at, p.last_seen
       FROM main.accounts a
       JOIN main.participants p 
       ON p.user_id = a.id 
       WHERE conversation_id = $1`,
      [input.conversationId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows;
  } catch (err) {
    throw mapPgError(err);
  }
}

export async function pgGetParticipantIds(
  input: GetParticipantIdsRepositoryInput
): Promise<PgGetParticipantIdsOutput[] | null> {
  try {
    const result = await pool.query(
      `SELECT user_id
       FROM main.participants
       WHERE conversation_id = $1`,
      [input.conversationId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows;
  } catch (err: any) {
    throw mapPgError(err);
  }
}

export async function pgGetMessages(
  input: PgGetMessagesInput
): Promise<PgMessageWithUsername[]> {
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

    return result.rows.reverse();
  } catch (err: any) {
    throw mapPgError(err);
  }
}

// ============================================================
// UPDATE
// ============================================================

// ============================================================
// DELETE
// ============================================================

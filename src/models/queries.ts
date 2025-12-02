import { pool } from "../configs/db";

import type { Participant, ConversationIdentifier } from "../types";

// ============================================================
// Create
// ============================================================
export async function pgCreateMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  try {
    await pool.query(
      `INSERT INTO main.messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)`,
      [conversationId, senderId, content]
    );

    return {
      status: 201,
      message: "Create message successfully",
    };
  } catch (err) {
    console.log("PgCreateMessage error: ", err);
    return null;
  }
}

// ============================================================
// Read
// ============================================================
export async function pgFindUserByEmail(email: string) {
  return await pool.query(
    `SELECT id, name, email FROM main.users WHERE email = $1 AND is_deleted = false`,
    [email]
  );
}

export async function pgFindAccountByUsername(username: string) {
  return await pool.query(
    `SELECT id, username, password FROM main.accounts WHERE username = $1 AND is_deleted = false`,
    [username]
  );
}

export async function pgGetParticipant(
  participantId: string
): Promise<Participant | null> {
  try {
    const result = await pool.query(
      `SELECT id, username 
       FROM main.accounts 
       WHERE id = $1`,
      [participantId]
    );
    return result.rows[0];
  } catch (err) {
    return null;
  }
}

export async function pgGetParticipantRole(
  userId: string,
  conversationId: string
) {
  try {
    const result = await pool.query(
      `SELECT role
       FROM main.participants
       WHERE user_id = $1 AND conversation_Id = $2`,
      [userId, conversationId]
    );
    return result.rows[0];
  } catch (err) {
    return null;
  }
}

export async function pgGetConversationIdentifiers(
  userId: string
): Promise<ConversationIdentifier[] | null> {
  try {
    const conversationIds = await pool.query(
      `SELECT c.conversation_id, c.type 
       FROM main.participants p 
       JOIN main.conversations c ON p.conversation_id = c.id 
       WHERE p.user_id = $1`,
      [userId]
    );

    return conversationIds.rows;
  } catch (err) {
    console.log("pgGetConversationIdentifiers error: ", err);
    return null;
  }
}

export async function pgGetParticipantIds(
  conversationId: string
): Promise<string[] | null> {
  try {
    const participantIds = await pool.query(
      `SELECT user_id
       FROM main.participants
       WHERE conversation_id = $1`,
      [conversationId]
    );

    return participantIds.rows;
  } catch (err) {
    console.log("PgGetParticipantIds error: ", err);
    return null;
  }
}

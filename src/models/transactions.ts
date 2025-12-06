import { pool } from "../configs/db";
import type {
  PgParticipant,
  PgRegisterTransactionInput,
  PgRegisterTransactionOutput,
  PgCreateConversationTransactionInput,
  PgCreateConversationTransactionOutput,
  PgAddParticipantsTransactionInput,
  PgGetConversationTransactionInput,
  PgGetConversationTransactionOutput,
  PgConversation,
} from "../types/models";

import type {} from "../";

export async function pgRegisterTransaction({
  name,
  email,
  username,
  password,
}: PgRegisterTransactionInput): Promise<PgRegisterTransactionOutput> {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN`);

    const user = await client.query(
      `INSERT INTO main.users (name, email) 
       VALUES ($1, $2) RETURNING id, name, email`,
      [name, email]
    );
    const account = await client.query(
      `INSERT INTO main.accounts (id, username, password) 
       VALUES ($1, $2, $3) RETURNING id, username, password`,
      [user.rows[0].id, username, password]
    );

    await client.query(`COMMIT`);
    return {
      user: user.rows[0],
      account: account.rows[0],
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw err;
  } finally {
    client.release();
  }
}

export async function pgCreateConversationTransaction({
  type,
  metadata,
  participantIds,
}: PgCreateConversationTransactionInput): Promise<PgCreateConversationTransactionOutput> {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN`);

    const conversationResult = await client.query(
      `INSERT INTO main.conversations (type, metadata)
       VALUES ($1, $2) RETURNING id, type, metadata`,
      [type, metadata]
    );

    let participants: PgParticipant[] = [];
    for (const participantId of participantIds) {
      if (participantId === conversationResult.rows[0].metadata.creator) {
        const participant = await client.query(
          `INSERT INTO main.participants (conversation_id, user_id, role)
           VALUES ($1, $2, $3) RETURNING user_id, conversation_id, role, last_seen, joined_at`,
          [conversationResult.rows[0].id, participantId, "admin"]
        );
        participants.push(participant.rows[0]);
      } else {
        const participant = await client.query(
          `INSERT INTO main.participants (conversation_id, user_id)
          VALUES ($1, $2) RETURNING user_id, conversation_id, role, last_seen, joined_at`,
          [conversationResult.rows[0].id, participantId]
        );
        participants.push(participant.rows[0]);
      }
    }

    await client.query(`COMMIT`);
    return {
      conversation: conversationResult.rows[0],
      participants,
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw err;
  } finally {
    client.release();
  }
}

export async function pgAddParticipantsTransaction({
  conversationId,
  participantIds,
}: PgAddParticipantsTransactionInput): Promise<PgParticipant[]> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let participants: PgParticipant[] = [];
    for (const userId of participantIds) {
      const participant = await client.query(
        `INSERT INTO main.participants (conversation_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (conversation_id, user_id)
         DO UPDATE SET conversation_id = EXCLUDED.conversation_id
         RETURNING user_id, conversation_id, role, last_seen, joined_at`,
        [conversationId, userId]
      );
      participants.push(participant.rows[0]);
    }

    await client.query("COMMIT");
    return participants;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function pgGetConversationTransaction({
  conversationId,
  limit = 10,
  offset = 0,
}: PgGetConversationTransactionInput): Promise<PgGetConversationTransactionOutput> {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN`);

    const resultConversation = await client.query(
      `SELECT id, type, metadata FROM main.conversations WHERE id = $1`,
      [conversationId]
    );

    const resultParticipants = await client.query(
      `SELECT user_id, role, last_seen, joined_at FROM main.participants WHERE conversation_id = $1`,
      [conversationId]
    );

    const resultMessages = await client.query(
      `SELECT m.id, m.content, m.sender_id, a.username as sender_username, m.conversation_id
       FROM main.messages m 
       JOIN main.accounts a ON a.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );

    await client.query(`COMMIT`);
    return {
      conversation: resultConversation.rows[0],
      participants: resultParticipants.rows,
      messages: resultMessages.rows,
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw err;
  } finally {
    client.release();
  }
}

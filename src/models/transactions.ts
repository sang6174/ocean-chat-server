import { pool } from "../configs/db";
import type { HttpResponse, ConversationMetadata } from "../types";

export async function pgRegisterTransaction(
  name: string,
  email: string,
  username: string,
  password: string
): Promise<HttpResponse> {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN`);

    const user = await client.query(
      `INSERT INTO main.users (name, email) 
       VALUES ($1, $2) RETURNING id`,
      [name, email]
    );
    await client.query(
      `INSERT INTO main.accounts (id, username, password) 
       VALUES ($1, $2, $3)`,
      [user.rows[0].id, username, password]
    );

    await client.query(`COMMIT`);
    return {
      status: 201,
      message: "Registration successful",
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw err;
  } finally {
    client.release();
  }
}

export async function pgCreateConversationWithParticipantsTransaction(
  type: string,
  metadata: ConversationMetadata,
  participantIds: string[]
) {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN`);

    const conversationResult = await client.query(
      `INSERT INTO main.conversations (type, metadata)
       VALUES ($1, $2) RETURNING id, type, metadata, created_at`,
      [type, metadata]
    );
    for (const participantId of participantIds) {
      if (participantId === conversationResult.rows[0].metadata.creator) {
        await client.query(
          `INSERT INTO main.participants (conversation_id, user_id, role)
          VALUES ($1, $2, $3) RETURNING *`,
          [conversationResult.rows[0].id, participantId, "admin"]
        );
      } else {
        await client.query(
          `INSERT INTO main.participants (conversation_id, user_id)
          VALUES ($1, $2) RETURNING *`,
          [conversationResult.rows[0].id, participantId]
        );
      }
    }

    await client.query(`COMMIT`);
    return {
      status: 201,
      message: "Create conversation and participants successfully",
      conversationResult,
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw err;
  } finally {
    client.release();
  }
}

export async function pgAddParticipantsTransaction(
  conversationId: string,
  participantIds: string[]
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const userId of participantIds) {
      await client.query(
        `INSERT INTO main.participants (conversation_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (conversation_id, user_id) DO NOTHING`,
        [conversationId, userId]
      );
    }

    await client.query("COMMIT");

    return {
      status: 201,
      message: "Participants added successfully",
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function pgGetConversationsTransaction(conversationId: string) {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN`);

    const resultConversation = await client.query(
      `SELECT id, type, metadata FROM main.conversations WHERE id = $1 AND is_deleted = FALSE`,
      [conversationId]
    );

    const resultParticipants = await client.query(
      `SELECT user_id, role, joined_at FROM main.participants WHERE conversation_id = $1`,
      [conversationId]
    );

    const resultMessages = await client.query(
      `SELECT sender_id, content, created_at FROM main.messages WHERE conversation_id = $1`,
      [conversationId]
    );

    await client.query(`COMMIT`);
    return {
      status: 200,
      message: "Get a conversation successfully.",
      data: {
        conversation: resultConversation.rows[0],
        participants: resultParticipants.rows,
        messages: resultMessages.rows,
      },
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw err;
  } finally {
    client.release();
  }
}

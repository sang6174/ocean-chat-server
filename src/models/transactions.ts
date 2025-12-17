import { pool } from "../configs/db";
import type {
  RegisterRepositoryInput,
  CreateConversationRepositoryInput,
  AddParticipantsRepositoryInput,
  GetConversationRepositoryInput,
  ConversationMetadata,
} from "../types/domain";
import type {
  PgParticipant,
  PgRegisterTransactionOutput,
  PgCreateConversationTransactionOutput,
  PgGetConversationTransactionOutput,
} from "../types/models";

import type {} from "../";
import type { BaseLogger } from "../helpers/logger";

export async function pgRegisterTransaction(
  baseLogger: BaseLogger,
  input: RegisterRepositoryInput
): Promise<PgRegisterTransactionOutput> {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN`);

    const user = await client.query(
      `INSERT INTO main.users (name, email) 
       VALUES ($1, $2) RETURNING id, name, email`,
      [input.name, input.email]
    );

    const account = await client.query(
      `INSERT INTO main.accounts (id, username, password) 
       VALUES ($1, $2, $3) RETURNING id, username`,
      [user.rows[0].id, input.username]
    );

    const metadata: ConversationMetadata = {
      name: account.rows[0].username,
      creator: {
        userId: user.rows[0].id,
        username: account.rows[0].username,
      },
    };

    const privateConversation = await client.query(
      `INSERT INTO main.conversations (type, metadata) 
       VALUES ($1, $2) RETURNING id, type, metadata`,
      ["myself", metadata]
    );

    await client.query(`COMMIT`);

    console.info("Register Transaction Successfully", {
      user: user.rows[0],
      account: account.rows[0],
      conversation: privateConversation.rows[0],
    });
    return {
      user: user.rows[0],
      account: account.rows[0],
      conversation: privateConversation.rows[0],
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw err;
  } finally {
    client.release();
  }
}

export async function pgCreateConversationTransaction(
  baseLogger: BaseLogger,
  input: CreateConversationRepositoryInput
): Promise<PgCreateConversationTransactionOutput> {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN`);

    const conversationResult = await client.query(
      `INSERT INTO main.conversations (type, metadata)
       VALUES ($1, $2) RETURNING id, type, metadata`,
      [input.type, input.metadata]
    );

    let participants: PgParticipant[] = [];
    for (const participantId of input.participantIds) {
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

export async function pgAddParticipantsTransaction(
  baseLogger: BaseLogger,
  input: AddParticipantsRepositoryInput
): Promise<PgParticipant[]> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let participants: PgParticipant[] = [];
    for (const userId of input.participantIds) {
      const participant = await client.query(
        `INSERT INTO main.participants (conversation_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (conversation_id, user_id)
         DO UPDATE SET conversation_id = EXCLUDED.conversation_id
         RETURNING user_id, conversation_id, role, last_seen, joined_at`,
        [input.conversationId, userId]
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

export async function pgGetConversationTransaction(
  baseLogger: BaseLogger,
  input: GetConversationRepositoryInput
): Promise<PgGetConversationTransactionOutput> {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN`);

    const resultConversation = await client.query(
      `SELECT id, type, metadata FROM main.conversations WHERE id = $1`,
      [input.conversationId]
    );

    const resultParticipants = await client.query(
      `SELECT user_id, role, last_seen, joined_at FROM main.participants WHERE conversation_id = $1`,
      [input.conversationId]
    );

    const resultMessages = await client.query(
      `SELECT m.id, m.content, m.sender_id, a.username as sender_username, m.conversation_id
       FROM main.messages m 
       JOIN main.accounts a ON a.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [input.conversationId, input.limit, input.offset]
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

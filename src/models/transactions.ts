import { pool } from "../configs/db";
import type {
  RegisterRepositoryInput,
  CreateConversationRepositoryInput,
  AddParticipantsRepositoryInput,
  ConversationMetadata,
} from "../types/domain";
import type {
  PgParticipant,
  PgParticipantNoConversationId,
  PgRegisterTransactionOutput,
  PgCreateConversationTransactionOutput,
  PgSendMessageTransactionInput,
  PgSendMessageTransactionOutput,
} from "../types/models";
import { mapPgError } from "../helpers/errors";
import { logger } from "../helpers/logger";

export async function pgRegisterTransaction(
  input: RegisterRepositoryInput
): Promise<PgRegisterTransactionOutput> {
  const client = await pool.connect();
  logger.info("Register transaction is started");
  try {
    await client.query(`BEGIN`);

    const user = await client.query(
      `INSERT INTO main.users (name, email) 
       VALUES ($1, $2) 
       RETURNING id, name, email`,
      [input.name, input.email]
    );

    const account = await client.query(
      `INSERT INTO main.accounts (id, username, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, username`,
      [user.rows[0].id, input.username, input.password]
    );

    const metadata: ConversationMetadata = {
      name: account.rows[0].username,
      creator: {
        id: user.rows[0].id,
        username: account.rows[0].username,
      },
    };

    const privateConversation = await client.query(
      `INSERT INTO main.conversations (type, metadata) 
       VALUES ($1, $2) 
       RETURNING id, type, metadata`,
      ["myself", metadata]
    );

    await client.query(
      `INSERT INTO main.participants (conversation_id, user_id, role)
       VALUES ($1, $2, $3) 
       RETURNING user_id, conversation_id, role, last_seen, joined_at`,
      [privateConversation.rows[0].id, user.rows[0].id, "admin"]
    );

    await client.query(`COMMIT`);
    logger.info("Register Transaction Successfully");

    return {
      user: user.rows[0],
      account: account.rows[0],
      conversation: privateConversation.rows[0],
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw mapPgError(err);
  } finally {
    client.release();
  }
}

export async function pgCreateConversationTransaction(
  input: CreateConversationRepositoryInput
): Promise<PgCreateConversationTransactionOutput> {
  const client = await pool.connect();
  logger.info("Create conversation transaction is started");
  try {
    await client.query(`BEGIN`);

    const conversationResult = await client.query(
      `INSERT INTO main.conversations (type, metadata)
       VALUES ($1, $2) 
       RETURNING id, type, metadata`,
      [input.type, input.metadata]
    );

    let participants: PgParticipantNoConversationId[] = [];
    for (const participant of input.participants) {
      if (participant.id === input.metadata.creator.id) {
        const participantResult = await client.query(
          `INSERT INTO main.participants (conversation_id, user_id, role)
           VALUES ($1, $2, $3) 
           RETURNING user_id, role, last_seen, joined_at`,
          [conversationResult.rows[0].id, participant.id, "admin"]
        );
        participants.push(participantResult.rows[0]);
      } else {
        const participantResult = await client.query(
          `INSERT INTO main.participants (conversation_id, user_id)
           VALUES ($1, $2) 
           RETURNING user_id, role, last_seen, joined_at`,
          [conversationResult.rows[0].id, participant.id]
        );
        participants.push(participantResult.rows[0]);
      }
    }

    await client.query(`COMMIT`);
    logger.info("Create conversation transaction successfully");

    return {
      conversation: conversationResult.rows[0],
      participants,
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw mapPgError(err);
  } finally {
    client.release();
  }
}

export async function pgAddParticipantsTransaction(
  input: AddParticipantsRepositoryInput
): Promise<PgParticipant[]> {
  const client = await pool.connect();
  logger.info("Add participants transaction is started");
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
    logger.info("Add participants transaction successfully");

    return participants;
  } catch (err) {
    await client.query("ROLLBACK");
    throw mapPgError(err);
  } finally {
    client.release();
  }
}

export async function pgSendMessageTransaction(
  input: PgSendMessageTransactionInput
): Promise<PgSendMessageTransactionOutput> {
  const client = await pool.connect();
  logger.info("Send message transaction is started");

  try {
    await client.query("BEGIN");

    // 1. Create message
    const messageResult = await client.query(
      `INSERT INTO main.messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, conversation_id, content`,
      [input.conversationId, input.senderId, input.content]
    );

    // 2. Get participants (for WS broadcast)
    const participantsResult = await client.query(
      `SELECT p.user_id, a.username, p.role, p.joined_at, p.last_seen
       FROM main.accounts a
       JOIN main.participants p 
       ON p.user_id = a.id 
       WHERE conversation_id = $1`,
      [input.conversationId]
    );

    // Check constraint or validation if needed
    if (participantsResult.rowCount === 0) {
      logger.warn(`sendMessageTransaction: No participants found for conversation ${input.conversationId}`);
    }

    await client.query("COMMIT");
    logger.info("Send message transaction successfully");

    return {
      message: messageResult.rows[0],
      participants: participantsResult.rows,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw mapPgError(err);
  } finally {
    client.release();
  }
}

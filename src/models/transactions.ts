import { pool } from "../configs/db";
import type {
  RegisterRepositoryInput,
  CreateConversationRepositoryInput,
  AddParticipantsRepositoryInput,
  CreateMessageRepositoryInput,
  AcceptFriendRequestRepositoryInput,
  DenyFriendRequestRepositoryInput,
} from "../types/domain";
import type {
  PgAddParticipantsOutput,
  PgRegisterOutput,
  PgCreateConversationOutput,
  PgCreateMessageOutput,
  PgAcceptFriendRequestOutput,
  PgDenyFriendRequestOutput,
} from "../types/models";
import { DomainError, mapPgError } from "../helpers/errors";
import { logger } from "../helpers/logger";

// Register transaction
export async function pgRegisterTransaction(
  input: RegisterRepositoryInput
): Promise<PgRegisterOutput> {
  const client = await pool.connect();
  logger.info("Register transaction is started");
  try {
    await client.query(`BEGIN`);

    const user = await client.query(
      `INSERT INTO main.users (name, email) 
       VALUES ($1, $2) 
       RETURNING id, name, email
      `,
      [input.name, input.email]
    );

    const account = await client.query(
      `INSERT INTO main.accounts (user_id, username, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, password, user_id
      `,
      [user.rows[0].id, input.username, input.password]
    );

    const conversation = await client.query(
      `INSERT INTO main.conversations (type, name, creator_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, type, name, last_event, creator_id
      `,
      ["myself", account.rows[0].username, user.rows[0].id]
    );

    const participant = await client.query(
      `INSERT INTO main.participants (conversation_id, user_id, role)
       VALUES ($1, $2, $3) 
       RETURNING conversation_id, user_id, role, last_seen, joined_at
      `,
      [conversation.rows[0].id, user.rows[0].id, "admin"]
    );

    let message = await client.query(
      `INSERT INTO main.messages (content, sender_id, conversation_id)
       VALUES ($1, $2, $3)
       RETURNING id, content, sender_id, conversation_id
      `,
      [
        `Private chat for ${account.rows[0].username}`,
        null,
        conversation.rows[0].id,
      ]
    );
    message.rows[0].sender_username = account.rows[0].username;

    await client.query(`COMMIT`);

    return {
      user: user.rows[0],
      account: account.rows[0],
      conversation: conversation.rows[0],
      participant: participant.rows[0],
      messages: message.rows,
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw mapPgError(err);
  } finally {
    client.release();
  }
}

// Create conversation transaction
export async function pgCreateConversationTransaction(
  input: CreateConversationRepositoryInput
): Promise<PgCreateConversationOutput> {
  const client = await pool.connect();
  logger.info("Create conversation transaction is started");
  try {
    await client.query(`BEGIN`);

    const conversationResult = await client.query(
      `INSERT INTO main.conversations (type, name, creator_id)
       VALUES ($1, $2, $3) 
       RETURNING id, type, name, creator_id, last_event
      `,
      [input.type, input.name, input.creator.id]
    );

    const participantIds = input.participantIds;
    if (!participantIds.length) {
      throw new DomainError({
        status: 400,
        code: "MISSING_PARTICIPANTS",
        message: "Conversation must have at least one participant",
      });
    }

    if (!participantIds.includes(input.creator.id)) {
      throw new DomainError({
        status: 400,
        code: "CREATOR_NOT_IN_PARTICIPANTS",
        message: "Creator must be included in participants",
      });
    }

    const values = participantIds
      .map(
        (_, i) =>
          `($1, $${i + 3}::uuid, CASE WHEN $${
            i + 3
          }::uuid = $2 THEN 'admin'::chat_role_type ELSE 'member'::chat_role_type END)`
      )
      .join(", ");

    const participantsResult = await client.query(
      `
      WITH inserted AS (
        INSERT INTO main.participants (conversation_id, user_id, role)
        VALUES ${values}
        RETURNING user_id, role, joined_at, last_seen
      )
      SELECT i.user_id, a.username, i.role, i.joined_at, i.last_seen
      FROM inserted i
      JOIN main.accounts a ON a.user_id = i.user_id
      `,
      [
        conversationResult.rows[0].id,
        conversationResult.rows[0].creator_id,
        ...participantIds,
      ]
    );

    const creatorParticipant = participantsResult.rows.find(
      (p) => p.role === "admin"
    );

    const messagesResult = await client.query(
      `INSERT INTO main.messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, sender_id
      `,
      [
        conversationResult.rows[0].id,
        null,
        `Group ${conversationResult.rows[0].name} is created by ${creatorParticipant.username}`,
      ]
    );

    await client.query(`COMMIT`);
    logger.info("Create conversation transaction successfully");

    return {
      conversation: conversationResult.rows[0],
      participants: participantsResult.rows,
      messages: messagesResult.rows,
    };
  } catch (err) {
    console.log(err);
    logger.error("Create conversation transaction failed");
    await client.query(`ROLLBACK`);
    throw mapPgError(err);
  } finally {
    client.release();
  }
}

export async function pgAddParticipantsTransaction(
  input: AddParticipantsRepositoryInput
): Promise<PgAddParticipantsOutput> {
  const client = await pool.connect();

  logger.info("Add participants transaction is started");

  try {
    await client.query("BEGIN");

    const valuesParticipant = input.participantIds
      .map((_, i) => `($1, $${i + 2}, 'member'::chat_role_type)`)
      .join(", ");

    const participantsResult = await client.query(
      `INSERT INTO main.participants (conversation_id, user_id, role)
       VALUES ${valuesParticipant}
       RETURNING user_id, role, joined_at, last_seen
      `,
      [input.conversationId, ...input.participantIds]
    );

    const valuesMessage = participantsResult.rows
      .map((_, i) => `($1, $2, $${i + 3})`)
      .join(", ");

    const messages = participantsResult.rows.map(
      (p) => `${p.username} is added to the group by ${input.creator.username}`
    );

    const messagesResult = await client.query(
      `INSERT INTO main.messages (conversation_id, sender_id, content)
       VALUES ${valuesMessage}
       RETURNING id, content, sender_id, conversation_id, created_at
      `,
      [input.conversationId, input.creator.id, ...messages]
    );

    await client.query(
      `UPDATE main.conversations
       SET last_event = $2
       WHERE id = $1;    
      `,
      [input.conversationId, messagesResult.rows[0].created_at]
    );

    await client.query("COMMIT");
    logger.info("Add participants transaction successfully");

    return {
      participants: participantsResult.rows,
      messages: messagesResult.rows,
    };
  } catch (err) {
    console.log(err);
    await client.query("ROLLBACK");
    throw mapPgError(err);
  } finally {
    client.release();
  }
}

export async function pgCreateMessageTransaction(
  input: CreateMessageRepositoryInput
): Promise<PgCreateMessageOutput> {
  const client = await pool.connect();
  logger.info("Send message transaction is started");

  try {
    await client.query("BEGIN");

    // Create message
    const messageResult = await client.query(
      `INSERT INTO main.messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, conversation_id, content, created_at`,
      [input.conversationId, input.senderId, input.content]
    );

    // Update last_event of conversation
    await client.query(
      `UPDATE main.conversations
       SET last_event = $2
       WHERE id = $1;    
      `,
      [input.conversationId, messageResult.rows[0].created_at]
    );

    // Get participants (for WS broadcast)
    const participantsResult = await client.query(
      `SELECT p.user_id, a.username, p.role, p.joined_at, p.last_seen
       FROM main.accounts a
       JOIN main.participants p ON p.user_id = a.user_id 
       WHERE conversation_id = $1`,
      [input.conversationId]
    );

    // Check constraint or validation if needed
    if (participantsResult.rowCount === 0) {
      logger.warn(
        `Create message transaction: No participants found for conversation ${input.conversationId}`
      );
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

export async function pgAcceptFriendRequestTransaction(
  input: AcceptFriendRequestRepositoryInput
): Promise<PgAcceptFriendRequestOutput> {
  const client = await pool.connect();
  logger.info("Accepted friend request transaction is started");
  try {
    await client.query(`BEGIN`);

    const conversationResult = await client.query(
      `INSERT INTO main.conversations (type, name, creator_id)
       VALUES ($1, $2, $3) 
       RETURNING id, type, name, creator_id, last_event
      `,
      ["direct", null, null]
    );

    const participantIds = [
      input.AcceptedFriendRequest.sender.id,
      input.AcceptedFriendRequest.recipient.id,
    ];

    const values = participantIds
      .map((_, i) => `($1, $${i + 2}, 'member')`)
      .join(", ");

    const participantsResult = await client.query(
      `
      WITH inserted AS (
        INSERT INTO main.participants (conversation_id, user_id, role)
        VALUES ${values}
        RETURNING user_id, role, joined_at, last_seen
      )
      SELECT i.user_id, a.username, i.role, i.joined_at, i.last_seen
      FROM inserted i
      JOIN main.accounts a ON a.user_id = i.user_id
      `,
      [conversationResult.rows[0].id, ...participantIds]
    );

    const messagesResult = await client.query(
      `INSERT INTO main.messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, sender_id
      `,
      [
        conversationResult.rows[0].id,
        null,
        `conversation of ${participantsResult.rows[0].username} and ${participantsResult.rows[1].username}`,
      ]
    );

    await client.query(
      `UPDATE main.notifications
       SET status = $1
       WHERE id = $2
       RETURNING id, type, status, sender_id, recipient_id
      `,
      [input.FriendRequest.status, input.FriendRequest.id]
    );

    const notification = await client.query(
      `INSERT INTO main.notifications (type, status, content, sender_id, recipient_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, type, status, sender_id, recipient_id
      `,
      [
        input.AcceptedFriendRequest.type,
        input.AcceptedFriendRequest.status,
        input.AcceptedFriendRequest.content,
        input.AcceptedFriendRequest.sender.id,
        input.AcceptedFriendRequest.recipient.id,
      ]
    );

    await client.query(`COMMIT`);
    logger.info("Accepted friend request transaction is finished");

    return {
      conversation: conversationResult.rows[0],
      participants: participantsResult.rows,
      messages: messagesResult.rows,
      notification: notification.rows[0],
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw mapPgError(err);
  } finally {
    client.release();
  }
}

export async function pgDenyFriendRequestTransaction(
  input: DenyFriendRequestRepositoryInput
): Promise<PgDenyFriendRequestOutput> {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN`);

    await client.query(
      `UPDATE main.notifications
       SET status = $1
       WHERE id = $2
       RETURNING id, type, status, sender_id, recipient_id
      `,
      [input.FriendRequest.status, input.FriendRequest.id]
    );

    const notification = await client.query(
      `INSERT INTO main.notifications (type, status, content, sender_id, recipient_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, type, status, content, sender_id, recipient_id
      `,
      [
        input.RejectedFriendRequest.type,
        input.RejectedFriendRequest.status,
        input.RejectedFriendRequest.content,
        input.RejectedFriendRequest.sender.id,
        input.RejectedFriendRequest.recipient.id,
      ]
    );

    await client.query(`COMMIT`);
    logger.info("Denied friend request transaction is finished");

    return {
      ...notification.rows[0],
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    throw mapPgError(err);
  } finally {
    client.release();
  }
}

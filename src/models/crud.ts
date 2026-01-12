import { pool } from "../configs/db";
import type {
  FindAccountByUsernameRepositoryInput,
  FindAccountByUserIdRepositoryInput,
  GetProfileUserRepositoryInput,
  GetParticipantRoleRepositoryInput,
  GetParticipantIdsByConversationIdRepositoryInput,
  GetConversationIdsRepositoryInput,
  GetConversationByIdRepositoryInput,
  SendFriendRequestRepositoryInput,
  CancelFriendRequestRepositoryInput,
  GetNotificationRepositoryInput,
  GetMessagesRepositoryInput,
  InsertRefreshTokenInput,
  FindRefreshTokenByHashInput,
  RevokeRefreshTokenRepositoryInput,
} from "../types/domain";
import type {
  PgAccount,
  PgGetMessagesOutput,
  PgGetProfileUserOutput,
  PgGetConversationByIdOutput,
  PgSendFriendRequestOutput,
  PgCancelFriendRequestOutput,
  PgGetNotificationOutput,
  PgGetConversationIdsOutput,
  PgGetParticipantRoleOutput,
  PgParticipantWithUsername,
  PgGetParticipantIdsOutput,
  PgRefreshToken,
} from "../types/models";
import { mapPgError } from "../helpers/errors";

// Find Account
export async function pgFindAccountByUsername(
  input: FindAccountByUsernameRepositoryInput
): Promise<PgAccount | null> {
  try {
    const result = await pool.query(
      `SELECT id, username, password, user_id 
       FROM main.accounts 
       WHERE username = $1 AND is_deleted = false
      `,
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

export async function pgFindAccountByUserId(
  input: FindAccountByUserIdRepositoryInput
): Promise<PgAccount | null> {
  try {
    const result = await pool.query(
      `SELECT id, username, password, user_id
       FROM main.accounts 
       WHERE user_id = $1 AND is_deleted = false
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

// Insert refresh token
export async function pgInsertRefreshToken(
  input: InsertRefreshTokenInput
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO main.refresh_tokens (id, user_id, token_hash, expires_at) 
       VALUES ($1, $2, $3, $4)
      `,
      [input.id, input.userId, input.tokenHash, input.expiresAt]
    );
  } catch (err: any) {
    throw mapPgError(err);
  }
}

// Find refresh token by hash
export async function pgFindRefreshTokenByHash(
  input: FindRefreshTokenByHashInput
): Promise<PgRefreshToken | null> {
  try {
    const result = await pool.query(
      `SELECT id, user_id, token_hash, expires_at, revoked_at, replaced_by
       FROM main.refresh_tokens
       WHERE token_hash = $1
      `,
      [input.tokenHash]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  } catch (err: any) {
    throw mapPgError(err);
  }
}

// Revoke refresh token
export async function pgRevokeRefreshToken(
  input: RevokeRefreshTokenRepositoryInput
): Promise<void> {
  try {
    await pool.query(
      `UPDATE main.refresh_tokens
       SET revoked_at = NOW(),
           replaced_by = NULL
       WHERE id = $1
      `,
      [input.tokenId]
    );
  } catch (err) {
    throw mapPgError(err);
  }
}

// Get Profile
export async function pgGetAllProfileUsers(): Promise<
  PgGetProfileUserOutput[] | null
> {
  try {
    const result = await pool.query(
      `SELECT u.id, a.username, u.name, u.email 
       FROM main.users u 
       JOIN main.accounts a ON u.id = a.user_id
       WHERE u.is_deleted = false
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
       JOIN main.accounts a ON u.id = a.user_id
       WHERE u.id = $1 AND u.is_deleted = false
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

// Get conversationIds by user id
export async function pgGetConversationIds(
  input: GetConversationIdsRepositoryInput
): Promise<PgGetConversationIdsOutput[] | null> {
  try {
    const result = await pool.query(
      `SELECT c.id 
       FROM main.participants p 
       JOIN main.conversations c ON p.conversation_id = c.id 
       WHERE p.user_id = $1 AND is_deleted = false
       ORDER BY c.last_event DESC
      `,
      [input.userId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows;
  } catch (err: any) {
    console.log(err);
    throw mapPgError(err);
  }
}

// Get conversations by id
export async function pgGetConversationById(
  input: GetConversationByIdRepositoryInput
): Promise<PgGetConversationByIdOutput> {
  try {
    const [conversation, participants, messages] = await Promise.all([
      pool.query(
        `SELECT id, type, name, last_event, creator_id
         FROM main.conversations
         WHERE id = $1
        `,
        [input.conversationId]
      ),
      pool.query(
        `SELECT p.user_id, a.username, p.role, p.last_seen, p.joined_at 
         FROM main.participants p
         JOIN main.accounts a
         ON a.user_id = p.user_id
         WHERE conversation_id = $1
        `,
        [input.conversationId]
      ),
      pool.query(
        `SELECT id, content, sender_id, m.is_deleted
         FROM main.messages m
         WHERE m.conversation_id = $1
         ORDER BY m.created_at DESC
         LIMIT $2 OFFSET $3
        `,
        [input.conversationId, input.limit, input.offset]
      ),
    ]);

    return {
      conversation: conversation.rows[0],
      participants: participants.rows,
      messages: messages.rows.reverse(), // Reverse to put newest message at the end
    };
  } catch (err: any) {
    throw mapPgError(err);
  }
}

// Get participant role
export async function pgGetParticipantRole(
  input: GetParticipantRoleRepositoryInput
): Promise<PgGetParticipantRoleOutput | null> {
  try {
    const result = await pool.query(
      `SELECT role
       FROM main.participants
       WHERE user_id = $1 AND conversation_id = $2
      `,
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

// Create a Friend Request Notification
export async function pgCreateFriendRequestNotification(
  input: SendFriendRequestRepositoryInput
): Promise<PgSendFriendRequestOutput> {
  try {
    const result = await pool.query(
      `INSERT INTO main.notifications (type, status, content, sender_id, recipient_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, type, status, is_read, content, sender_id, recipient_id
      `,
      [
        input.type,
        input.status,
        input.content,
        input.sender.id,
        input.recipient.id,
      ]
    );

    return result.rows[0];
  } catch (err: any) {
    throw mapPgError(err);
  }
}

export async function pgGetParticipantByConversationId(input: {
  conversationId: string;
}): Promise<PgParticipantWithUsername[] | null> {
  try {
    const result = await pool.query(
      `SELECT p.user_id, a.username, p.role, p.joined_at, p.last_seen
       FROM main.accounts a
       JOIN main.participants p 
       ON p.user_id = a.user_id 
       WHERE conversation_id = $1
      `,
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
  input: GetParticipantIdsByConversationIdRepositoryInput
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
  input: GetMessagesRepositoryInput
): Promise<PgGetMessagesOutput[]> {
  try {
    const result = await pool.query(
      `SELECT m.id, m.content, m.sender_id, a.username as sender_username, m.conversation_id, m.is_deleted
       FROM main.messages m
       LEFT JOIN main.accounts a ON a.user_id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [input.conversationId, input.limit, input.offset]
    );

    return result.rows.reverse(); // Newest message at the end
  } catch (err: any) {
    throw mapPgError(err);
  }
}

export async function pgGetNotifications(
  input: GetNotificationRepositoryInput
): Promise<PgGetNotificationOutput[]> {
  try {
    const result = await pool.query(
      `SELECT id, type, status, is_read, content, sender_id, recipient_id
       FROM main.notifications
       WHERE sender_id = $1 OR recipient_id = $1
       ORDER BY created_at DESC
      `,
      [input.userId]
    );

    return result.rows;
  } catch (err: any) {
    throw mapPgError(err);
  }
}

export async function pgGetNotificationById(
  id: string
): Promise<PgGetNotificationOutput | null> {
  try {
    const result = await pool.query(
      `SELECT id, type, status, is_read, content, sender_id, recipient_id
       FROM main.notifications
       WHERE id = $1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  } catch (err: any) {
    throw mapPgError(err);
  }
}

export async function pgCancelFriendRequestNotification(
  input: CancelFriendRequestRepositoryInput
): Promise<PgCancelFriendRequestOutput> {
  try {
    const result = await pool.query(
      `UPDATE main.notifications
       SET status = $1
       WHERE id = $2
       RETURNING id, type, status, is_read, content, sender_id, recipient_id
      `,
      [input.status, input.id]
    );

    return result.rows[0];
  } catch (err) {
    console.log(err);
    throw mapPgError(err);
  }
}

export async function pgMarkNotificationsAsRead(input: {
  userId: string;
}): Promise<void> {
  try {
    await pool.query(
      `UPDATE main.notifications
       SET is_read = TRUE
       WHERE recipient_id = $1 AND is_read = FALSE
      `,
      [input.userId]
    );
  } catch (err: any) {
    throw mapPgError(err);
  }
}

// Check if two users are friends (have a direct conversation)
export async function pgCheckFriendship(
  userId1: string,
  userId2: string
): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT 1
       FROM main.conversations c
       JOIN main.participants p1 ON c.id = p1.conversation_id
       JOIN main.participants p2 ON c.id = p2.conversation_id
       WHERE c.type = 'direct'
         AND p1.user_id = $1
         AND p2.user_id = $2
         AND c.is_deleted = false
       LIMIT 1
      `,
      [userId1, userId2]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (err: any) {
    throw mapPgError(err);
  }
}

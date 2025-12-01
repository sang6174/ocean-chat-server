import { pool } from "../configs/db";

import type { Participant } from "../types";

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

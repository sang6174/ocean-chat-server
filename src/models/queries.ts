import { pool } from "../configs/db";

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

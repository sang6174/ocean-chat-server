import { Pool } from "pg";

console.log(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  const result = await pool.query(
    `SELECT p.user_id, a.username, p.role, p.last_seen, p.joined_at 
         FROM main.participants p
         JOIN main.accounts a
         ON a.id = p.user_id
         WHERE conversation_id = $1`,
    ["db28455a-5687-4510-8b08-3518fe39c6e9"]
  );
  console.log(result.rows);
} catch (err: unknown) {
  console.log(err);
}

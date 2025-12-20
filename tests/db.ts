import { Pool } from "pg";

console.log(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  // b98c6c40-b6ac-4c3f-a7bb-0be48ab59bb0
  // thanhsang123
  const result = await pool.query(
    `SELECT c.id 
       FROM main.participants p 
       JOIN main.conversations c ON p.conversation_id = c.id 
       WHERE p.user_id = $1`,
    ["b1467ac9-4e43-4ba2-95fd-612369c82ea1"]
  );
  console.log(result.rows);
} catch (err: unknown) {
  console.log(err);
}

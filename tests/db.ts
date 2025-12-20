import { Pool } from "pg";

console.log(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  const result = await pool.query(`SELECT * FROM main.users`);
  console.log(result.rows);
} catch (err: unknown) {
  console.log(err);
}

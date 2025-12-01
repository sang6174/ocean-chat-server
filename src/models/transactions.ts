import { pool } from "../configs/db";
import type { HttpResponse } from "../types";

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

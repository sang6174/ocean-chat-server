import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

try {
  const result = await client.query('SELECT * FROM main.conversations');
  console.log(result.rows);
} catch (err) {
  console.log(err);
}

client.end();


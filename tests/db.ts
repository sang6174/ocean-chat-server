import { Client } from "pg";

console.log(process.env.DATABASE_URL);

interface PgError extends Error {
  code: string;
  detail?: string;
  table?: string;
  constraint?: string;
  severity?: string;
  routine?: string;
  file?: string;
}

function isPgError(err: unknown): err is PgError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as any).code === "string"
  );
}

export const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

try {
  // b98c6c40-b6ac-4c3f-a7bb-0be48ab59bb0
  // thanhsang1234
  const result = await client.query(
    `SELECT u.id, a.username, u.name, u.email 
       FROM main.users u 
       JOIN main.accounts a ON u.id = a.id
      `
  );

  console.log(result.rows);
} catch (err: unknown) {
  if (isPgError(err)) {
    console.log("SQLSTATE code:", err.code);
    console.log("Table:", err.table);
    console.log("Constraint:", err.constraint);
    console.log("Detail:", err.detail);
  } else if (err instanceof Error) {
    console.error("Generic error:", err.message);
  } else {
    console.error("Unknown error:", err);
  }
}

client.end();

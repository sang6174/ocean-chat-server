import { Pool } from "pg";

console.log(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 5000,
  maxLifetimeSeconds: 60,
});

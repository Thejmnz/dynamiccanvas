import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error(
    "CRITICAL: DATABASE_URL is not defined in environment variables!",
  );
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
});

export const db = drizzle(pool, { schema });

/**
 * Applies SQL files in supabase/migrations/ to a remote Supabase Postgres database.
 *
 * Usage (from project root):
 *   set SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
 *   node --env-file=.env.local scripts/apply-supabase-migrations.mjs
 *
 * Get the URI from Supabase Dashboard → Project Settings → Database → Connection string (URI).
 * Use the "Session" or "Transaction" pooler for serverless; direct connection works for one-off setup.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";
import { resolvePgConfig } from "./resolve-pg-config.mjs";

const { config: pgConfig, source } = resolvePgConfig();

if (!pgConfig) {
  console.error(
    "Set SUPABASE_DB_PASSWORD + project ref (or SUPABASE_DB_URL). See .env.example.",
  );
  process.exit(1);
}

console.log("Database connection via", source);

const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
const files = fs
  .readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

const client = new pg.Client(pgConfig);

await client.connect();

await client.query(`
  create table if not exists public._maxacademy_migrations (
    version text primary key,
    applied_at timestamptz not null default now()
  );
`);

for (const file of files) {
  const { rows } = await client.query(
    "select 1 from public._maxacademy_migrations where version = $1",
    [file],
  );

  if (rows.length > 0) {
    console.log("skip (already applied):", file);
    continue;
  }

  const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
  console.log("apply:", file);

  try {
    await client.query("begin");
    await client.query(sql);
    await client.query(
      "insert into public._maxacademy_migrations (version) values ($1)",
      [file],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    console.error("Migration failed:", file);
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await client.end();
console.log("All migrations applied.");

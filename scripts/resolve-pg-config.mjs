/**
 * Builds pg Client config. Prefer SUPABASE_DB_PASSWORD (plain text, supports @ and special chars)
 * over SUPABASE_DB_URL to avoid URI encoding mistakes.
 */
export function resolvePgConfig() {
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const ref =
    process.env.SUPABASE_PROJECT_REF?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
      /https:\/\/([^.]+)\.supabase\.co/,
    )?.[1];

  if (password && ref) {
    const region = process.env.SUPABASE_DB_REGION?.trim() || "eu-central-1";
    const host =
      process.env.SUPABASE_DB_HOST?.trim() ||
      `aws-0-${region}.pooler.supabase.com`;
    const port = Number(process.env.SUPABASE_DB_PORT || 5432);

    return {
      config: {
        user: `postgres.${ref}`,
        password,
        host,
        port,
        database: "postgres",
        ssl: { rejectUnauthorized: false },
      },
      source: `pooler ${host}:${port}`,
    };
  }

  const connectionString =
    process.env.SUPABASE_DB_URL?.trim() ||
    process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    return { config: null, source: null };
  }

  return {
    config: {
      connectionString,
      ssl: { rejectUnauthorized: false },
    },
    source: "SUPABASE_DB_URL",
  };
}

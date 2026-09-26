/**
 * After `npx supabase link`, prints env vars to copy into .env.local.
 * Requires: supabase CLI logged in (`npx supabase login`) and project linked.
 */
import { execSync } from "node:child_process";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
}

try {
  const status = run("npx supabase status -o json");
  const parsed = JSON.parse(status);
  const apiUrl = parsed.API_URL ?? parsed.api_url;
  const anonKey = parsed.ANON_KEY ?? parsed.anon_key;
  const serviceKey = parsed.SERVICE_ROLE_KEY ?? parsed.service_role_key;

  if (!apiUrl || !anonKey) {
    console.log(
      "Linked remote project detected but keys missing. Copy from Dashboard → Project Settings → API.",
    );
    process.exit(0);
  }

  console.log("\n# Add to .env.local:\n");
  console.log(`NEXT_PUBLIC_SUPABASE_URL=${apiUrl}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`);
  if (serviceKey) {
    console.log(`SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`);
  } else {
    console.log(
      "# SUPABASE_SERVICE_ROLE_KEY=... (Dashboard → API → service_role — server only)",
    );
  }
  console.log(
    "\n# SUPABASE_DB_URL=postgresql://... (Dashboard → Database → Connection string URI)\n",
  );
} catch {
  console.log("Could not read linked project. For a remote Supabase project:");
  console.log("  1. npx supabase login");
  console.log("  2. npx supabase link --project-ref <your-project-ref>");
  console.log("  3. Re-run: node scripts/print-supabase-env.mjs");
  console.log("\nOr copy URL and keys from https://supabase.com/dashboard → Project Settings → API.");
}

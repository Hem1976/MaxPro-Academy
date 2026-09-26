import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function loadEnvLocal() {
  const text = readFileSync(".env.local", "utf8");
  const map = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    map[line.slice(0, i)] = line.slice(i + 1).trim();
  }
  return map;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase URL or service role key in .env.local");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tables = [
  "profiles",
  "products",
  "courses",
  "modules",
  "lessons",
  "app_settings",
];

for (const table of tables) {
  const { error } = await sb.from(table).select("id").limit(1);
  if (error) {
    console.log(`${table}: not ready (${error.code ?? ""} ${error.message})`);
  } else {
    console.log(`${table}: ok`);
  }
}

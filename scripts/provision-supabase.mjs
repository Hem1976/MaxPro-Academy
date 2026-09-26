/**
 * Creates a Supabase project via Management API, writes keys to .env.local,
 * applies migrations, and bootstraps super admin.
 *
 * Prerequisite: Personal access token with project + org permissions.
 * Create at https://supabase.com/dashboard/account/tokens
 *
 * Add to .env.local:
 *   SUPABASE_ACCESS_TOKEN=sbp_...
 * Optional:
 *   SUPABASE_ORG_SLUG=your-org-slug
 *   SUPABASE_DB_PASSWORD=... (min 8 chars; generated if omitted)
 *   ADMIN_EMAIL=admin@maxproinfotech.com
 *   ADMIN_PASSWORD=... (for bootstrap; prompted if missing)
 *
 * Usage: node --env-file=.env.local scripts/provision-supabase.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const API = "https://api.supabase.com/v1";
const PROJECT_NAME = process.env.SUPABASE_PROJECT_NAME?.trim() || "MaxAcademy";
const REGION =
  process.env.SUPABASE_REGION?.trim() || "eu-central-1";

const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
if (!token) {
  console.error(
    "Set SUPABASE_ACCESS_TOKEN in .env.local (Dashboard → Account → Access Tokens).",
  );
  process.exit(1);
}

async function api(method, route, body) {
  const response = await fetch(`${API}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      `${method} ${route} → ${response.status}: ${typeof data === "object" ? JSON.stringify(data) : data}`,
    );
  }

  return data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function upsertEnvLocal(updates) {
  const envPath = path.join(process.cwd(), ".env.local");
  const lines = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8").split(/\r?\n/)
    : [];

  const map = new Map();
  for (const line of lines) {
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }
    const idx = line.indexOf("=");
    map.set(line.slice(0, idx), line.slice(idx + 1));
  }

  for (const [key, value] of Object.entries(updates)) {
    map.set(key, value);
  }

  const preserved = lines.filter(
    (line) =>
      !line ||
      line.startsWith("#") ||
      !line.includes("=") ||
      !updates.hasOwnProperty(line.slice(0, line.indexOf("="))),
  );

  const merged = [
    ...preserved.filter((l) => l.trim() !== ""),
    ...Object.entries(updates).map(([k, v]) => `${k}=${v}`),
  ];

  fs.writeFileSync(envPath, `${merged.join("\n")}\n`, "utf8");
  console.log("Updated .env.local with Supabase keys.");
}

function poolerDatabaseUrl(projectRef, dbPassword, region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const user = `postgres.${projectRef}`;
  const encoded = encodeURIComponent(dbPassword);
  return `postgresql://${user}:${encoded}@${host}:6543/postgres`;
}

async function main() {
  const orgs = await api("GET", "/organizations");
  if (!Array.isArray(orgs) || orgs.length === 0) {
    throw new Error("No organizations found for this token.");
  }

  const orgSlug =
    process.env.SUPABASE_ORG_SLUG?.trim() ||
    orgs[0].slug ||
    orgs[0].id;

  console.log("Using organization:", orgSlug);

  const existing = await api("GET", "/projects");
  let project = existing.find(
    (p) => p.name?.toLowerCase() === PROJECT_NAME.toLowerCase(),
  );

  const dbPassword =
    process.env.SUPABASE_DB_PASSWORD?.trim() ||
    crypto.randomBytes(18).toString("base64url");

  if (!project) {
    console.log("Creating project:", PROJECT_NAME);
    project = await api("POST", "/projects", {
      name: PROJECT_NAME,
      organization_slug: orgSlug,
      db_pass: dbPassword,
      region: REGION,
    });
  } else {
    console.log("Project already exists:", project.name, project.ref);
  }

  const ref = project.ref;
  if (!ref) {
    throw new Error("Project ref missing from API response.");
  }

  console.log("Waiting for project to become active…");
  for (let i = 0; i < 60; i += 1) {
    const status = await api("GET", `/projects/${ref}`);
    const state = status.status || status.project?.status;
    if (
      state === "ACTIVE_HEALTHY" ||
      state === "ACTIVE" ||
      state === "COMING_UP"
    ) {
      if (state === "ACTIVE_HEALTHY" || state === "ACTIVE") {
        break;
      }
    }
    await sleep(5000);
  }

  const keys = await api("GET", `/projects/${ref}/api-keys`);
  const anon =
    keys.find((k) => k.name === "anon" || k.type === "anon")?.api_key ??
    keys.find((k) => k.name === "anon")?.key;
  const service =
    keys.find((k) => k.name === "service_role" || k.type === "service_role")
      ?.api_key ??
    keys.find((k) => k.name === "service_role")?.key;

  if (!anon || !service) {
    throw new Error(
      `Could not read API keys: ${JSON.stringify(keys).slice(0, 500)}`,
    );
  }

  const apiUrl = `https://${ref}.supabase.co`;
  const region = project.region || REGION;
  const dbUrl = poolerDatabaseUrl(ref, dbPassword, region);

  upsertEnvLocal({
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    SUPABASE_SERVICE_ROLE_KEY: service,
    SUPABASE_DB_URL: dbUrl,
    SUPABASE_PROJECT_REF: ref,
  });

  if (!process.env.SUPABASE_DB_PASSWORD) {
    const secretPath = path.join(process.cwd(), ".supabase-db-password.local");
    fs.writeFileSync(
      secretPath,
      `# Database password for ${PROJECT_NAME} (${ref})\n${dbPassword}\n`,
      "utf8",
    );
    console.log(
      `Database password saved to ${secretPath} (gitignored). Add SUPABASE_DB_PASSWORD to .env.local if you recreate the pooler URL.`,
    );
  }

  console.log("Applying migrations…");
  const migrate = spawnSync(
    process.execPath,
    ["--env-file=.env.local", "scripts/apply-supabase-migrations.mjs"],
    { cwd: process.cwd(), stdio: "inherit", env: process.env },
  );
  if (migrate.status !== 0) {
    process.exit(migrate.status ?? 1);
  }

  const adminPassword =
    process.env.ADMIN_PASSWORD?.trim() ||
    process.env.SUPABASE_BOOTSTRAP_ADMIN_PASSWORD?.trim();

  if (adminPassword && adminPassword.length >= 8) {
    console.log("Bootstrapping super admin…");
    const boot = spawnSync(
      "npx",
      [
        "tsx",
        "--env-file=.env.local",
        "scripts/bootstrap-supabase-admin.ts",
        process.env.ADMIN_EMAIL || "admin@maxproinfotech.com",
        adminPassword,
      ],
      { cwd: process.cwd(), stdio: "inherit", shell: true },
    );
    if (boot.status !== 0) {
      process.exit(boot.status ?? 1);
    }
  } else {
    console.log(
      "Skip admin bootstrap: set ADMIN_PASSWORD (8+ chars) in .env.local and run npm run supabase:bootstrap-admin",
    );
  }

  console.log("\nDone.");
  console.log("Project ref:", ref);
  console.log("API URL:", apiUrl);
  console.log("Restart npm run dev, then sign in at /admin/login");
  console.log(
    "In Dashboard → Authentication → URL configuration, add Site URL http://localhost:3000 and redirect URLs for localhost + Vercel.",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

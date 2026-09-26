/**
 * Creates (or updates) the first super_admin in Supabase Auth + profiles.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/bootstrap-supabase-admin.ts [email] [password]
 *
 * Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local (never commit real passwords).
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? "admin@maxproinfotech.com")
  .trim()
  .toLowerCase();
const password = process.argv[3] ?? process.env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

if (!password || password.length < 8) {
  console.error(
    "Provide a password (8+ chars) as the second argument or ADMIN_PASSWORD in .env.local",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(target: string): Promise<string | null> {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(error.message);
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === target,
    );
    if (match) {
      return match.id;
    }

    if (data.users.length < perPage) {
      return null;
    }
    page += 1;
  }
}

async function main() {
  let userId: string | null = null;

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Maxpro Academy Admin" },
    });

  if (createError) {
    const alreadyExists =
      createError.message.toLowerCase().includes("already") ||
      createError.status === 422;
    if (!alreadyExists) {
      console.error("createUser failed:", createError.message);
      process.exit(1);
    }
    userId = await findUserIdByEmail(email);
    if (!userId) {
      console.error("User exists but could not resolve id for", email);
      process.exit(1);
    }
    const { error: updateAuthError } = await admin.auth.admin.updateUserById(
      userId,
      { password },
    );
    if (updateAuthError) {
      console.error("updateUserById failed:", updateAuthError.message);
      process.exit(1);
    }
    console.log("Updated password for existing user:", email);
  } else {
    userId = created.user?.id ?? null;
    console.log("Created user:", email);
  }

  if (!userId) {
    console.error("No user id");
    process.exit(1);
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: "Maxpro Academy Admin",
      role: "super_admin",
      onboarding_completed: true,
      is_active: true,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("profiles upsert failed:", profileError.message);
    process.exit(1);
  }

  console.log("Super admin ready:", email);
  console.log("Sign in at /admin/login");
}

main();

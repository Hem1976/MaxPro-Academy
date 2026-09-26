import { cookies } from "next/headers";
import { isSupabaseConfigured, type DemoUserSession } from "@/lib/data/demo-store";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER_COOKIE } from "@/lib/auth/constants";
import type { Profile } from "@/types/database";

export interface CurrentUser {
  id: string;
  email: string;
  profile: Profile;
}

function demoSessionToProfile(session: DemoUserSession): Profile {
  const now = new Date().toISOString();

  return {
    id: session.id,
    full_name: session.full_name,
    email: session.email,
    avatar_url: session.avatar_url ?? null,
    role: session.role,
    company: session.company ?? null,
    job_title: session.job_title ?? null,
    phone: session.phone ?? null,
    learning_role: session.learning_role ?? null,
    preferred_product_ids: session.preferred_product_ids ?? null,
    onboarding_completed: session.onboarding_completed,
    is_active: true,
    created_at: session.created_at ?? now,
    updated_at: session.updated_at ?? now,
  };
}

export async function getDemoUserFromCookies(): Promise<DemoUserSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(DEMO_USER_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DemoUserSession;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) {
    const session = await getDemoUserFromCookies();
    if (!session) {
      return null;
    }

    return {
      id: session.id,
      email: session.email,
      profile: demoSessionToProfile(session),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? profile.email,
    profile: profile as Profile,
  };
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

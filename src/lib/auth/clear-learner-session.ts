import { cookies } from "next/headers";
import { DEMO_USER_COOKIE } from "@/lib/auth/constants";
import { isSupabaseConfigured } from "@/lib/data/demo-store";
import { createClient } from "@/lib/supabase/server";

/** Clears learner session so activation is not hijacked by another demo user cookie. */
export async function clearLearnerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_USER_COOKIE);

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
}

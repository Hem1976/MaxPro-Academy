"use server";

import { cookies } from "next/headers";
import { requireCurrentUser } from "@/lib/auth/get-user";
import { actionError, actionSuccess, type ActionResult } from "@/lib/auth/action-result";
import { DEMO_USER_COOKIE } from "@/lib/auth/constants";
import {
  isSupabaseConfigured,
  updateDemoUser,
  type DemoUserSession,
} from "@/lib/data/demo-store";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validations/schemas";
import type { Profile } from "@/types/database";

async function syncDemoCookie(session: DemoUserSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_USER_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function updateProfile(
  formData: FormData,
): Promise<ActionResult<Profile>> {
  const user = await requireCurrentUser();

  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName") || undefined,
    company: formData.get("company") || null,
    jobTitle: formData.get("jobTitle") || null,
    learningRole: formData.get("learningRole") || null,
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid profile data");
  }

  const { fullName, company, jobTitle, learningRole } = parsed.data;

  if (!isSupabaseConfigured()) {
    const updated = updateDemoUser(user.id, {
      full_name: fullName ?? user.profile.full_name ?? "",
      company: company ?? null,
      job_title: jobTitle ?? null,
      learning_role: learningRole ?? null,
    });

    if (!updated) {
      return actionError("Unable to update profile");
    }

    await syncDemoCookie(updated);

    return actionSuccess({
      ...user.profile,
      full_name: updated.full_name,
      company: updated.company ?? null,
      job_title: updated.job_title ?? null,
      learning_role: updated.learning_role ?? null,
      updated_at: updated.updated_at ?? new Date().toISOString(),
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      company,
      job_title: jobTitle,
      learning_role: learningRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to update profile");
  }

  return actionSuccess(data as Profile);
}

"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clearLearnerSession } from "@/lib/auth/clear-learner-session";
import { DEMO_USER_COOKIE } from "@/lib/auth/constants";
import { actionError, type ActionResult } from "@/lib/auth/action-result";
import { canAccessAdmin } from "@/lib/auth/roles";
import {
  canUsePortal,
  portalMismatchMessage,
  safeAdminNext,
  safeLearnerNext,
  type AuthPortal,
} from "@/lib/auth/portals";
import {
  authenticateDemoUser,
  isSupabaseConfigured,
  registerDemoUser,
  setDemoUser,
  updateDemoUser,
  updateDemoUserPassword,
} from "@/lib/data/demo-store";
import {
  isPostmarkConfigured,
  sendPasswordResetEmail,
} from "@/lib/email/postmark";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getEmailAppPublicUrl } from "@/lib/email/postmark-config";
import {
  loginSchema,
  onboardingSchema,
  passwordResetSchema,
  signupSchema,
} from "@/lib/validations/schemas";
import type { OnboardingInput } from "@/lib/validations/schemas";
import type { UserRole } from "@/types/database";

const DEMO_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function formatAuthServiceError(message: string): string {
  if (message === "fetch failed") {
    return "Could not reach the authentication service. Check your internet connection and try again.";
  }
  return message;
}

function authServiceFailure(error: unknown): ActionResult<never> {
  if (error instanceof Error) {
    return actionError(formatAuthServiceError(error.message));
  }
  return actionError("Unable to sign in");
}

async function setDemoUserCookie(
  session: ReturnType<typeof setDemoUser>,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_USER_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEMO_COOKIE_MAX_AGE,
  });
}

async function clearDemoUserCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_USER_COOKIE);
}

export async function signUp(
  formData: FormData,
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { fullName, email, password } = parsed.data;

  if (!isSupabaseConfigured()) {
    try {
      const session = registerDemoUser({
        email,
        password,
        full_name: fullName,
      });
      await setDemoUserCookie(session);
      redirect("/onboarding");
    } catch (error) {
      return actionError(
        error instanceof Error ? error.message : "Unable to create account",
      );
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return actionError(error.message);
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      role: "customer",
      onboarding_completed: false,
      is_active: true,
    });
  }

  redirect("/onboarding");
}

export async function signIn(
  formData: FormData,
): Promise<ActionResult<{ redirectTo: string }>> {
  return signInToPortal(formData, "learner");
}

export async function signInAdmin(
  formData: FormData,
): Promise<ActionResult<{ redirectTo: string }>> {
  return signInToPortal(formData, "admin");
}

async function signInToPortal(
  formData: FormData,
  portal: AuthPortal,
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { email, password } = parsed.data;
  const rawNext = String(formData.get("next") ?? "");
  const destination =
    portal === "admin" ? safeAdminNext(rawNext) : safeLearnerNext(rawNext);

  if (!isSupabaseConfigured()) {
    const session = authenticateDemoUser(email, password);
    if (!session) {
      return actionError("Invalid email or password");
    }

    if (!canUsePortal(session.role, portal)) {
      return actionError(portalMismatchMessage(portal));
    }

    await setDemoUserCookie(session);
    const home =
      portal === "admin"
        ? destination
        : session.onboarding_completed
          ? destination
          : "/onboarding";
    redirect(home);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return actionError(formatAuthServiceError(error.message));
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return actionError("Unable to sign in");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      return actionError(formatAuthServiceError(profileError.message));
    }

    const role = (profile?.role as UserRole | undefined) ?? "customer";

    if (!canUsePortal(role, portal)) {
      await supabase.auth.signOut();
      return actionError(portalMismatchMessage(portal));
    }

    if (portal === "learner" && !profile?.onboarding_completed) {
      redirect("/onboarding");
    }

    redirect(destination);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return authServiceFailure(error);
  }
}

export async function signOut(portal?: AuthPortal): Promise<void> {
  const loginPath = portal === "admin" ? "/admin/login" : "/login";

  if (!isSupabaseConfigured()) {
    await clearDemoUserCookie();
    redirect(loginPath);
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(loginPath);
}

export async function activateAccount(
  formData: FormData,
): Promise<ActionResult<{ redirectTo: string }>> {
  await clearLearnerSession();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const temporaryPassword = String(formData.get("temporaryPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return actionError("Enter a valid email address");
  }

  if (temporaryPassword.length < 1) {
    return actionError("Enter the temporary password from your email");
  }

  if (newPassword.length < 8) {
    return actionError("New password must be at least 8 characters");
  }

  if (newPassword !== confirmPassword) {
    return actionError("New passwords do not match");
  }

  if (newPassword === temporaryPassword) {
    return actionError("Choose a new password different from the temporary one");
  }

  if (!isSupabaseConfigured()) {
    const valid = authenticateDemoUser(email, temporaryPassword);
    if (!valid) {
      return actionError("Email or temporary password is incorrect");
    }

    const updated = updateDemoUserPassword(
      email,
      temporaryPassword,
      newPassword,
    );
    if (!updated) {
      return actionError("Unable to update password");
    }

    await clearLearnerSession();
    redirect("/login?activated=1&email=" + encodeURIComponent(email));
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: temporaryPassword,
  });

  if (signInError) {
    return actionError("Email or temporary password is incorrect");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  await supabase.auth.signOut();

  if (updateError) {
    return actionError(updateError.message);
  }

  await clearLearnerSession();
  redirect("/login?activated=1&email=" + encodeURIComponent(email));
}

export async function resetPassword(
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return actionError("Enter a valid email address");
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: {
        message:
          "Demo mode: password reset is simulated. Use your existing demo credentials or create a new account.",
      },
    };
  }

  if (!isPostmarkConfigured()) {
    return actionError(
      "Password reset email is not configured. Please contact support.",
    );
  }

  const normalizedEmail = email.toLowerCase();
  const admin = createServiceRoleClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: normalizedEmail,
    options: {
      redirectTo: `${getEmailAppPublicUrl()}/reset-password`,
    },
  });

  if (error || !data.properties?.hashed_token) {
    return {
      success: true,
      data: {
        message:
          "If an account exists for that email, we sent a link to choose a new password.",
      },
    };
  }

  const meta = data.user.user_metadata as { full_name?: string } | undefined;
  const fullName =
    meta?.full_name?.trim() ||
    normalizedEmail.split("@")[0] ||
    "Learner";

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("email", normalizedEmail)
    .maybeSingle();

  const displayName =
    profile?.full_name?.trim() || fullName;

  const sent = await sendPasswordResetEmail({
    to: normalizedEmail,
    fullName: displayName,
    email: normalizedEmail,
    hashedToken: data.properties.hashed_token,
  });

  if (!sent.ok) {
    return actionError(sent.error);
  }

  return {
    success: true,
    data: {
      message:
        "If an account exists for that email, we sent a link to choose a new password.",
    },
  };
}

export async function completePasswordReset(
  formData: FormData,
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = passwordResetSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { newPassword } = parsed.data;

  if (!isSupabaseConfigured()) {
    return actionError(
      "Password reset via email is not available in demo mode. Use your existing demo password or activate your account.",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionError(
      "Your reset link has expired or is invalid. Request a new link below.",
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return actionError(updateError.message);
  }

  await supabase.auth.signOut();
  await clearLearnerSession();

  const email = user.email ?? "";
  redirect(
    "/login?activated=1&email=" + encodeURIComponent(email),
  );
}

export async function completeOnboarding(
  data: OnboardingInput,
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = onboardingSchema.safeParse(data);

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const payload = parsed.data;

  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const raw = cookieStore.get(DEMO_USER_COOKIE)?.value;

    if (!raw) {
      return actionError("You must be signed in to complete onboarding");
    }

    let session: ReturnType<typeof setDemoUser>;
    try {
      session = JSON.parse(raw) as ReturnType<typeof setDemoUser>;
    } catch {
      return actionError("Invalid session");
    }

    const updated = updateDemoUser(session.id, {
      full_name: payload.fullName,
      company: payload.company ?? null,
      job_title: payload.jobTitle ?? null,
      learning_role: payload.learningRole,
      preferred_product_ids: payload.preferredProductIds,
      onboarding_completed: true,
    });

    if (!updated) {
      return actionError("Unable to update profile");
    }

    await setDemoUserCookie(updated);
    redirect(canAccessAdmin(updated.role) ? "/admin/dashboard" : "/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionError("You must be signed in to complete onboarding");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: payload.fullName,
      company: payload.company ?? null,
      job_title: payload.jobTitle ?? null,
      learning_role: payload.learningRole,
      preferred_product_ids: payload.preferredProductIds,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return actionError(error.message);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  redirect(
    canAccessAdmin(profile?.role as UserRole | undefined)
      ? "/admin/dashboard"
      : "/dashboard",
  );
}

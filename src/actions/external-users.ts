"use server";

import { requireCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";
import { generateTemporaryPassword } from "@/lib/auth/temporary-password";
import { actionError, actionSuccess, type ActionResult } from "@/lib/auth/action-result";
import {
  isPostmarkConfigured,
  sendCredentialsInviteEmail,
} from "@/lib/email/postmark";
import {
  isSupabaseConfigured,
  upsertDemoLearnerInvite,
} from "@/lib/data/demo-store";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { parseExternalUsersCsv } from "@/lib/validations/external-users-csv";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (!canAccessAdmin(user.profile.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export type ExternalUserImportRowResult = {
  email: string;
  fullName: string;
  status: "created" | "skipped" | "failed";
  message: string;
};

export async function importExternalUsersFromCsv(
  csvText: string,
): Promise<
  ActionResult<{
    results: ExternalUserImportRowResult[];
    summary: { created: number; skipped: number; failed: number };
    emailsEnabled: boolean;
  }>
> {
  await requireAdmin();

  let rows;
  try {
    rows = parseExternalUsersCsv(csvText);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid CSV file";
    return actionError(message);
  }

  const emailsEnabled = isPostmarkConfigured();
  const results: ExternalUserImportRowResult[] = [];

  for (const row of rows) {
    const password = generateTemporaryPassword();

    try {
      if (!isSupabaseConfigured()) {
        upsertDemoLearnerInvite({
          email: row.email,
          password,
          full_name: row.fullName,
          company: row.company,
          job_title: row.position,
          phone: row.phone,
        });
      } else {
        const admin = createServiceRoleClient();
        const { data, error } = await admin.auth.admin.createUser({
          email: row.email,
          password,
          email_confirm: true,
          user_metadata: { full_name: row.fullName },
        });

        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            results.push({
              email: row.email,
              fullName: row.fullName,
              status: "skipped",
              message: "Account already exists",
            });
            continue;
          }
          throw new Error(error.message);
        }

        if (!data.user) {
          throw new Error("User was not created");
        }

        const { error: profileError } = await admin.from("profiles").upsert({
          id: data.user.id,
          email: row.email.toLowerCase(),
          full_name: row.fullName,
          company: row.company,
          job_title: row.position,
          phone: row.phone,
          role: "customer",
          onboarding_completed: false,
          is_active: true,
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          throw new Error(profileError.message);
        }
      }

      if (emailsEnabled) {
        const sent = await sendCredentialsInviteEmail({
          to: row.email,
          fullName: row.fullName,
          email: row.email,
          temporaryPassword: password,
          company: row.company,
          position: row.position,
        });

        if (!sent.ok) {
          results.push({
            email: row.email,
            fullName: row.fullName,
            status: "failed",
            message: `Account created but email failed: ${sent.error}`,
          });
          continue;
        }

        results.push({
          email: row.email,
          fullName: row.fullName,
          status: "created",
          message: "Account created and credentials emailed",
        });
      } else {
        results.push({
          email: row.email,
          fullName: row.fullName,
          status: "created",
          message:
            "Account created (Postmark not configured — credentials not emailed)",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import failed";
      if (message.toLowerCase().includes("already exists")) {
        results.push({
          email: row.email,
          fullName: row.fullName,
          status: "skipped",
          message: "Account already exists",
        });
      } else {
        results.push({
          email: row.email,
          fullName: row.fullName,
          status: "failed",
          message,
        });
      }
    }
  }

  const summary = {
    created: results.filter((item) => item.status === "created").length,
    skipped: results.filter((item) => item.status === "skipped").length,
    failed: results.filter((item) => item.status === "failed").length,
  };

  return actionSuccess({ results, summary, emailsEnabled });
}

export async function getExternalUserImportStatus(): Promise<
  ActionResult<{ postmarkConfigured: boolean; appUrl: string }>
> {
  await requireAdmin();
  return actionSuccess({
    postmarkConfigured: isPostmarkConfigured(),
    appUrl:
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3000",
  });
}

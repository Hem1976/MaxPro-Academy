import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signInAdmin } from "@/actions/auth";
import { AuthField, AuthForm, AuthLink } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";
import { getDemoAdminEmail } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Admin sign in | Maxpro Academy",
  description: "Sign in to the Maxpro Academy staff console.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user && canAccessAdmin(user.profile.role)) {
    redirect("/admin/dashboard");
  }
  if (user && !canAccessAdmin(user.profile.role)) {
    redirect("/dashboard");
  }

  const { next } = await searchParams;
  const adminEmail = getDemoAdminEmail();

  return (
    <AuthShell eyebrow="Staff">
      <AuthForm
        title="Admin sign in"
        description="For staff only. Learners use the main sign-in."
        submitLabel="Sign in"
        action={signInAdmin}
        next={typeof next === "string" ? next : undefined}
        hint={
          <div className="rounded-md border border-border bg-surface px-3 py-2 text-left text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Demo login</p>
            <p className="mt-1">
              {adminEmail} — any password
            </p>
          </div>
        }
        footer={
          <p>
            Learner?{" "}
            <AuthLink href="/login">Sign in here</AuthLink>
          </p>
        }
      >
        <AuthField
          id="email"
          label="Staff email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <AuthField
          id="password"
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </AuthForm>
    </AuthShell>
  );
}

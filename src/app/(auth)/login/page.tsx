import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signIn } from "@/actions/auth";
import { AuthField, AuthForm, AuthLink } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Learner sign in | Maxpro Academy",
  description: "Sign in to continue your learning journey.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const user = await getCurrentUser();
  if (user && canAccessAdmin(user.profile.role)) {
    redirect("/admin/dashboard");
  }
  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const activated = params.activated === "1";
  const prefilledEmail =
    typeof params.email === "string" ? params.email.trim() : "";

  return (
    <AuthForm
      title="Learner sign in"
      description="Sign in to access your courses, progress, and certificates."
      submitLabel="Sign in"
      action={signIn}
      next={next}
      hint={
        <>
          {activated && (
            <div className="mb-3 rounded-md border border-success/30 bg-success/5 px-3 py-2 text-left text-xs text-success">
              Your password was updated. Sign in with your email and new
              password.
            </div>
          )}
          <div className="rounded-md border border-border bg-surface px-3 py-2 text-left text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Demo learner account</p>
            <p className="mt-1">amina.saleh@maxproinfotech.com — password demo</p>
          </div>
        </>
      }
      footer={
        <>
          <p>
            Don&apos;t have an account?{" "}
            <AuthLink href="/signup">Create one</AuthLink>
          </p>
          <p className="mt-2">
            <AuthLink href="/forgot-password">Forgot your password?</AuthLink>
          </p>
          <p className="mt-4">
            Academy staff?{" "}
            <AuthLink href="/admin/login">Admin sign-in</AuthLink>
          </p>
        </>
      }
    >
      <AuthField
        id="email"
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        defaultValue={prefilledEmail}
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
  );
}

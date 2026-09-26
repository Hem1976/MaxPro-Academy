import { AuthLink } from "@/components/auth/auth-form";

export function ResetPasswordGate({ demoMode }: { demoMode?: boolean }) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-navy">Reset link required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {demoMode
            ? "Email password reset is not available in demo mode. Use your existing demo password or activate your account with a temporary password."
            : "Open the password reset link from your email to choose a new password. Links expire after a short time for your security."}
        </p>
      </div>

      <div className="rounded-md border border-border bg-surface px-3 py-3 text-center text-sm text-muted-foreground">
        <p>
          <AuthLink href="/forgot-password">Send reset email</AuthLink>
          {" · "}
          <AuthLink href="/login">Learner sign in</AuthLink>
        </p>
      </div>
    </div>
  );
}

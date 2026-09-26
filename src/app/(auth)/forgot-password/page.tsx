import type { Metadata } from "next";
import { resetPassword } from "@/actions/auth";
import { AuthField, AuthForm, AuthLink } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Forgot password | Maxpro Academy",
  description: "Request a password reset link for your Maxpro Academy account.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps<"/forgot-password">) {
  const params = await searchParams;
  const invalidLink = params.error === "invalid_link";

  return (
    <AuthForm
      title="Forgot your password?"
      description="Enter your work email and we will send a link to choose a new password. First-time external learners should activate their account instead."
      submitLabel="Send reset link"
      action={resetPassword}
      hint={
        invalidLink ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-left text-xs text-destructive">
            That reset link is invalid or has expired. Request a new one below.
          </div>
        ) : undefined
      }
      footer={
        <>
          <p>
            Remember your password?{" "}
            <AuthLink href="/login">Learner sign in</AuthLink>
          </p>
          <p className="mt-2">
            <AuthLink href="/signup">Create account</AuthLink>
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
      />
    </AuthForm>
  );
}

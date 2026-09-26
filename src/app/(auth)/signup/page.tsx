import type { Metadata } from "next";
import { signUp } from "@/actions/auth";
import { AuthField, AuthForm, AuthLink } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create account | Maxpro Academy",
  description: "Join Maxpro Academy and start learning today.",
};

export default function SignupPage() {
  return (
    <AuthForm
      title="Create your account"
      description="Get started with structured training for Rockey, RocketSales, and the full Maxpro portfolio."
      submitLabel="Create account"
      action={signUp}
      footer={
        <>
          <p>
            Already have a learner account?{" "}
            <AuthLink href="/login">Sign in</AuthLink>
          </p>
          <p className="mt-2">
            Academy staff?{" "}
            <AuthLink href="/admin/login">Admin sign-in</AuthLink>
          </p>
        </>
      }
    >
      <AuthField
        id="fullName"
        label="Full name"
        name="fullName"
        required
        autoComplete="name"
      />
      <AuthField
        id="email"
        label="Work email"
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
        autoComplete="new-password"
      />
      <AuthField
        id="confirmPassword"
        label="Confirm password"
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
      />
    </AuthForm>
  );
}

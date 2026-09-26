"use client";

import { activateAccount } from "@/actions/auth";
import { AuthField, AuthForm, AuthLink } from "@/components/auth/auth-form";

interface ActivateAccountFormProps {
  defaultEmail: string;
}

export function ActivateAccountForm({ defaultEmail }: ActivateAccountFormProps) {
  return (
    <AuthForm
      title="Activate your account"
      description="Enter the temporary password from your email, then choose a new password. You will sign in on the next screen."
      submitLabel="Set password & continue"
      action={activateAccount}
      footer={
        <p>
          Already activated?{" "}
          <AuthLink href="/login">Learner sign in</AuthLink>
          {" · "}
          <AuthLink href="/forgot-password">Forgot password</AuthLink>
        </p>
      }
    >
      <AuthField
        id="email"
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        defaultValue={defaultEmail}
      />
      <AuthField
        id="temporaryPassword"
        label="Temporary password"
        name="temporaryPassword"
        type="password"
        required
        autoComplete="current-password"
      />
      <AuthField
        id="newPassword"
        label="New password"
        name="newPassword"
        type="password"
        required
        autoComplete="new-password"
      />
      <AuthField
        id="confirmPassword"
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
      />
    </AuthForm>
  );
}

"use client";

import { completePasswordReset } from "@/actions/auth";
import { AuthField, AuthForm, AuthLink } from "@/components/auth/auth-form";

export function ResetPasswordForm() {
  return (
    <AuthForm
      title="Choose a new password"
      description="Enter and confirm your new password. You will sign in on the next screen."
      submitLabel="Update password"
      action={completePasswordReset}
      footer={
        <p>
          Need a new link?{" "}
          <AuthLink href="/forgot-password">Request reset email</AuthLink>
          {" · "}
          <AuthLink href="/login">Learner sign in</AuthLink>
        </p>
      }
    >
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

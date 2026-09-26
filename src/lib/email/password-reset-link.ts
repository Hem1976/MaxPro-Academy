import { getEmailAppPublicUrl } from "@/lib/email/postmark-config";

/** App URL for recovery links (uses production host in local dev). */
export function buildPasswordResetConfirmUrl(hashedToken: string): string {
  const base = getEmailAppPublicUrl();
  const params = new URLSearchParams({
    token_hash: hashedToken,
    type: "recovery",
    next: "/reset-password",
  });
  return `${base}/auth/confirm?${params.toString()}`;
}

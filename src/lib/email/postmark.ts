import {
  getEmailAppPublicUrl,
  getPostmarkConfig,
  isPostmarkConfigured,
} from "@/lib/email/postmark-config";
import { resolveEmailLogoForPostmark } from "@/lib/email/inline-logo";
import { buildPasswordResetConfirmUrl } from "@/lib/email/password-reset-link";
import { renderCredentialsInviteEmail } from "@/lib/email/templates/credentials-invite";
import { renderPasswordResetEmail } from "@/lib/email/templates/password-reset";

export { isPostmarkConfigured };

export interface SendCredentialsEmailInput {
  to: string;
  fullName: string;
  email: string;
  temporaryPassword: string;
  company: string;
  position: string;
}

export async function sendCredentialsInviteEmail(
  input: SendCredentialsEmailInput,
): Promise<{ ok: true; messageId: string } | { ok: false; error: string }> {
  const config = getPostmarkConfig();

  if (!config) {
    return {
      ok: false,
      error:
        "Postmark is not configured. Set POSTMARK_API_KEY and POSTMARK_SENDER_EMAIL.",
    };
  }

  const appUrl = getEmailAppPublicUrl();
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
    "helpdesk@maxproinfotech.com";

  const activateUrl = `${appUrl}/activate?email=${encodeURIComponent(input.email)}`;
  const { logoUrl, attachments } = await resolveEmailLogoForPostmark();

  const { subject, html, text } = renderCredentialsInviteEmail({
    fullName: input.fullName,
    email: input.email,
    temporaryPassword: input.temporaryPassword,
    company: input.company,
    position: input.position,
    activateUrl,
    logoUrl,
    supportEmail,
  });

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": config.token,
    },
    body: JSON.stringify({
      From: config.from,
      To: input.to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text,
      MessageStream: config.messageStream,
      Tag: "external-learner-invite",
      ...(attachments.length > 0 ? { Attachments: attachments } : {}),
    }),
  });

  const payload = (await response.json()) as {
    MessageID?: string;
    Message?: string;
    ErrorCode?: number;
  };

  if (!response.ok) {
    return {
      ok: false,
      error: payload.Message ?? `Postmark error (${response.status})`,
    };
  }

  return { ok: true, messageId: payload.MessageID ?? "sent" };
}

export interface SendPasswordResetEmailInput {
  to: string;
  fullName: string;
  email: string;
  hashedToken: string;
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput,
): Promise<{ ok: true; messageId: string } | { ok: false; error: string }> {
  const config = getPostmarkConfig();

  if (!config) {
    return {
      ok: false,
      error:
        "Postmark is not configured. Set POSTMARK_API_KEY and POSTMARK_SENDER_EMAIL.",
    };
  }

  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
    "helpdesk@maxproinfotech.com";

  const resetUrl = buildPasswordResetConfirmUrl(input.hashedToken);
  const { logoUrl, attachments } = await resolveEmailLogoForPostmark();

  const { subject, html, text } = renderPasswordResetEmail({
    fullName: input.fullName,
    email: input.email,
    resetUrl,
    logoUrl,
    supportEmail,
  });

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": config.token,
    },
    body: JSON.stringify({
      From: config.from,
      To: input.to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text,
      MessageStream: config.messageStream,
      Tag: "password-reset",
      ...(attachments.length > 0 ? { Attachments: attachments } : {}),
    }),
  });

  const payload = (await response.json()) as {
    MessageID?: string;
    Message?: string;
    ErrorCode?: number;
  };

  if (!response.ok) {
    return {
      ok: false,
      error: payload.Message ?? `Postmark error (${response.status})`,
    };
  }

  return { ok: true, messageId: payload.MessageID ?? "sent" };
}

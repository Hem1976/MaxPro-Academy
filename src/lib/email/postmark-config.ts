export interface PostmarkConfig {
  token: string;
  from: string;
  messageStream: string;
}

/** Resolves Postmark env (supports legacy and current variable names). */
export function getPostmarkConfig(): PostmarkConfig | null {
  const token =
    process.env.POSTMARK_API_KEY?.trim() ||
    process.env.POSTMARK_SERVER_TOKEN?.trim();

  const senderEmail =
    process.env.POSTMARK_SENDER_EMAIL?.trim() ||
    process.env.POSTMARK_FROM_EMAIL?.trim();

  const senderName =
    process.env.POSTMARK_SENDER_NAME?.trim() ||
    process.env.POSTMARK_FROM_NAME?.trim();

  if (!token || !senderEmail) {
    return null;
  }

  const from = senderName
    ? `${senderName} <${senderEmail}>`
    : senderEmail;

  return {
    token,
    from,
    messageStream: process.env.POSTMARK_MESSAGE_STREAM?.trim() || "outbound",
  };
}

export function isPostmarkConfigured(): boolean {
  return getPostmarkConfig() !== null;
}

const PRODUCTION_APP_FALLBACK = "https://maxpro-academy.vercel.app";

export function getAppPublicUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) {
    return explicit;
  }

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }

  return "http://localhost:3000";
}

/** Public HTTPS base URL for links and images inside emails (never localhost). */
export function getEmailAppPublicUrl(): string {
  const emailOverride = process.env.NEXT_PUBLIC_EMAIL_APP_URL?.replace(
    /\/$/,
    "",
  );
  if (emailOverride) {
    return emailOverride;
  }

  const appUrl = getAppPublicUrl();
  if (!appUrl.includes("localhost") && !appUrl.includes("127.0.0.1")) {
    return appUrl;
  }

  return PRODUCTION_APP_FALLBACK;
}

/** Hosted logo for HTML emails (must exist under `public/` on the email app URL). */
export function getLogoUrlForEmail(): string {
  const base = getEmailAppPublicUrl();
  return `${base}/MAXPRO-email.png`;
}

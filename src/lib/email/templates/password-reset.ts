export interface PasswordResetEmailInput {
  fullName: string;
  email: string;
  resetUrl: string;
  logoUrl: string;
  supportEmail: string;
  /** Shown in the email; default 60 minutes. */
  linkExpiresMinutes?: number;
}

const BRAND = {
  navy: "#0b1f3a",
  navyDeep: "#071528",
  accent: "#1e4a7a",
  accentBright: "#2f6fad",
  cyan: "#00a0c8",
  surface: "#f4f7fb",
  card: "#ffffff",
  muted: "#64748b",
  border: "#e2e8f0",
  warningBg: "#fff8e6",
  warningBorder: "#fde68a",
  warningText: "#92400e",
} as const;

export function renderPasswordResetEmail(
  input: PasswordResetEmailInput,
): { subject: string; html: string; text: string } {
  const expiresMinutes = input.linkExpiresMinutes ?? 60;
  const subject = "Reset your Maxpro Academy password";
  const firstName = input.fullName.trim().split(/\s+/)[0] || "there";

  const text = `Hello ${input.fullName},

We received a request to reset the password for your Maxpro Academy learner account.

Account: ${input.email}

Reset your password (link expires in ${expiresMinutes} minutes):
${input.resetUrl}

If the button does not work, copy and paste the link above into your browser.

If you did not request a password reset, ignore this email — your password will stay the same.

Support: ${input.supportEmail}

— Maxpro Academy · Learn. Apply. Grow.
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Segoe UI, Helvetica, Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:${BRAND.surface};font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Reset your learner password for ${escapeHtml(input.email)} — link expires in ${expiresMinutes} minutes.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.surface};padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:0 0 20px;text-align:center;">
              <img src="${escapeHtml(input.logoUrl)}" alt="Maxpro" width="168" style="display:inline-block;height:auto;max-height:48px;width:auto;max-width:200px;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="background:${BRAND.card};border-radius:20px;overflow:hidden;border:1px solid ${BRAND.border};box-shadow:0 16px 48px rgba(11,31,58,0.1);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="height:6px;background:linear-gradient(90deg,${BRAND.navy} 0%,${BRAND.accent} 45%,${BRAND.cyan} 100%);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:32px 32px 24px;background:linear-gradient(180deg,${BRAND.navyDeep} 0%,${BRAND.navy} 100%);">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:14px;">
                          <div style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.12);text-align:center;line-height:44px;font-size:22px;">🔒</div>
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Password reset</p>
                          <h1 style="margin:6px 0 0;font-size:24px;line-height:1.3;font-weight:600;color:#ffffff;">Hi ${escapeHtml(firstName)}, let&apos;s secure your account</h1>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:18px 0 0;font-size:15px;line-height:1.55;color:rgba(255,255,255,0.88);">Someone requested a new password for your Maxpro Academy learner account. If this was you, continue below.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 32px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid ${BRAND.border};border-radius:14px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.muted};">Account</p>
                          <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${escapeHtml(input.email)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 32px;text-align:center;">
                    <a href="${escapeHtml(input.resetUrl)}" style="display:inline-block;padding:15px 32px;background:${BRAND.accent};color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:999px;box-shadow:0 8px 24px rgba(30,74,122,0.35);">Choose a new password</a>
                    <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:${BRAND.muted};">This link expires in <strong style="color:#334155;">${expiresMinutes} minutes</strong> for your security.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 28px;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.08em;">Button not working?</p>
                    <p style="margin:0;font-size:13px;line-height:1.6;color:#475569;word-break:break-all;">
                      <a href="${escapeHtml(input.resetUrl)}" style="color:${BRAND.accentBright};text-decoration:underline;">${escapeHtml(input.resetUrl)}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 28px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.warningBg};border:1px solid ${BRAND.warningBorder};border-radius:12px;">
                      <tr>
                        <td style="padding:16px 18px;font-size:13px;line-height:1.55;color:${BRAND.warningText};">
                          <strong>Didn&apos;t request this?</strong> You can ignore this email. Your password will not change unless you use the link above.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 32px 26px;border-top:1px solid ${BRAND.border};background:#fafbfc;text-align:center;">
                    <p style="margin:0 0 6px;font-size:13px;color:${BRAND.muted};">Need help? <a href="mailto:${escapeHtml(input.supportEmail)}" style="color:${BRAND.accent};font-weight:600;text-decoration:none;">${escapeHtml(input.supportEmail)}</a></p>
                    <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} Maxpro Infotech · Maxpro Academy</p>
                    <p style="margin:6px 0 0;font-size:11px;color:#cbd5e1;">Learn. Apply. Grow.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

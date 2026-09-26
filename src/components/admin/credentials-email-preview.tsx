"use client";

import { useMemo } from "react";
import { renderCredentialsInviteEmail } from "@/lib/email/templates/credentials-invite";

interface CredentialsEmailPreviewProps {
  appUrl: string;
  supportEmail: string;
}

export function CredentialsEmailPreview({
  appUrl,
  supportEmail,
}: CredentialsEmailPreviewProps) {
  const html = useMemo(
    () =>
      renderCredentialsInviteEmail({
        fullName: "Amina Saleh",
        email: "amina.external@example.com",
        temporaryPassword: "Mx9k!pQ2vL8n",
        company: "Pharma Distributors Lebanon",
        position: "Medical Representative",
        activateUrl: `${appUrl}/activate?email=${encodeURIComponent("amina.external@example.com")}`,
        logoUrl: `${appUrl}/MAXPRO-email.png`,
        supportEmail,
      }).html,
    [appUrl, supportEmail],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-surface px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Email preview
      </div>
      <iframe
        title="Credentials invite email preview"
        srcDoc={html}
        className="h-[520px] w-full border-0 bg-white"
        sandbox=""
      />
    </div>
  );
}

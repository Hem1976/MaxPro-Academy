import { describe, expect, it } from "vitest";
import { renderPasswordResetEmail } from "@/lib/email/templates/password-reset";

describe("renderPasswordResetEmail", () => {
  it("renders branded HTML with reset CTA", () => {
    const { subject, html, text } = renderPasswordResetEmail({
      fullName: "Amina Saleh",
      email: "amina@example.com",
      resetUrl:
        "https://maxpro-academy.vercel.app/auth/confirm?token_hash=abc&type=recovery&next=%2Freset-password",
      logoUrl: "cid:maxpro-logo",
      supportEmail: "help@maxpro.com",
    });

    expect(subject).toContain("Maxpro Academy");
    expect(html).toContain("Choose a new password");
    expect(html).toContain("amina@example.com");
    expect(html).toContain("token_hash=abc");
    expect(html).toContain("Didn&apos;t request this?");
    expect(html).toContain("60 minutes");
    expect(text).toContain("Reset your password");
  });
});

import { describe, expect, it } from "vitest";
import { renderCredentialsInviteEmail } from "@/lib/email/templates/credentials-invite";

describe("renderCredentialsInviteEmail", () => {
  it("renders branded HTML with credentials and login CTA", () => {
    const { subject, html, text } = renderCredentialsInviteEmail({
      fullName: "Amina Saleh",
      email: "amina@example.com",
      temporaryPassword: "TestPass123!",
      company: "Pharma Co",
      position: "Medical Rep",
      activateUrl: "https://maxpro-academy.vercel.app/activate?email=amina%40example.com",
      logoUrl: "https://maxpro-academy.vercel.app/MAXPRO-email.png",
      supportEmail: "help@maxpro.com",
    });

    expect(subject).toContain("Maxpro Academy");
    expect(html).toContain("amina@example.com");
    expect(html).toContain("TestPass123!");
    expect(html).toContain("Activate account");
    expect(html).toContain("MAXPRO-email.png");
    expect(html).toContain("change your password");
    expect(text).toContain("Temporary password: TestPass123!");
  });
});

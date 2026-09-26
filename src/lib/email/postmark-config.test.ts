import { afterEach, describe, expect, it } from "vitest";
import {
  getEmailAppPublicUrl,
  getLogoUrlForEmail,
} from "@/lib/email/postmark-config";

describe("getEmailAppPublicUrl", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
  });

  it("never uses localhost for email assets", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    delete process.env.NEXT_PUBLIC_EMAIL_APP_URL;
    delete process.env.VERCEL_URL;

    expect(getEmailAppPublicUrl()).toBe("https://maxpro-academy.vercel.app");
    expect(getLogoUrlForEmail()).toContain("MAXPRO-email.png");
    expect(getLogoUrlForEmail()).not.toContain("localhost");
  });

  it("respects NEXT_PUBLIC_EMAIL_APP_URL override", () => {
    process.env.NEXT_PUBLIC_EMAIL_APP_URL = "https://academy.example.com";
    expect(getEmailAppPublicUrl()).toBe("https://academy.example.com");
  });
});

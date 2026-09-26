import { describe, expect, it } from "vitest";
import {
  buildCertificatePayload,
  generateCertificatePdf,
} from "@/lib/certificates/generate";
import { getCertificateCopy } from "@/lib/certificates/template";

describe("certificate template", () => {
  it("fills learner name, course title, and completion date", () => {
    const copy = getCertificateCopy({
      recipientName: "Amina Saleh",
      courseTitle: "Rockey Fundamentals",
      issuedAt: "2026-09-21T10:00:00.000Z",
    });

    expect(copy.recipientName).toBe("Amina Saleh");
    expect(copy.courseLabel).toBe("Rockey Fundamentals course");
    expect(copy.completionLine).toBe(
      "for successfully completing the Rockey Fundamentals course on September 21, 2026",
    );
  });

  it("writes the filled template into a landscape PDF", () => {
    const payload = buildCertificatePayload({
      certificateNumber: "MAXPRO-ACADEMY-000101",
      verificationToken: "demo-cert-amina-rockey",
      issuedAt: "2026-09-21T10:00:00.000Z",
      profile: {
        full_name: "Amina Saleh",
        email: "amina.saleh@maxproinfotech.com",
      },
      course: {
        title: "Rockey Fundamentals",
        slug: "rockey-fundamentals",
      },
      baseUrl: "http://localhost:3000",
    });

    const result = generateCertificatePdf(payload);
    const header = String.fromCharCode(...result.pdfBytes.slice(0, 4));
    const pdfText = Buffer.from(result.pdfBytes).toString("latin1");

    expect(header).toBe("%PDF");
    expect(result.payload.recipientName).toBe("Amina Saleh");
    expect(result.payload.courseTitle).toBe("Rockey Fundamentals");
    expect(pdfText).toContain("Amina Saleh");
    expect(pdfText).toContain("Rockey Fundamentals");
    expect(pdfText).toContain("September 21, 2026");
    expect(pdfText).toContain("CERTIFICATE");
    expect(pdfText).toContain("Hemant Patel");
    expect(pdfText).not.toContain("Aldo Sitorus");
  });
});

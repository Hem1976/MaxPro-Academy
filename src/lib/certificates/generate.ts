import { readFileSync } from "node:fs";
import { join } from "node:path";
import { jsPDF } from "jspdf";
import type { Course, Profile } from "@/types/database";
import {
  CERTIFICATE_COLORS,
  CERTIFICATE_LOGO_SIZE,
  CERTIFICATE_SIGNATORY,
  getCertificateCopy,
} from "@/lib/certificates/template";

export interface CertificatePayload {
  certificateNumber: string;
  verificationToken: string;
  issuedAt: string;
  recipientName: string;
  recipientEmail: string;
  courseTitle: string;
  courseSlug: string;
  productName?: string;
  verificationUrl: string;
}

export interface CertificatePdfResult {
  payload: CertificatePayload;
  pdfBase64: string;
  pdfBytes: Uint8Array;
}

export function generateCertificateNumber(sequence: number): string {
  const padded = String(Math.max(1, sequence)).padStart(6, "0");
  return `MAXPRO-ACADEMY-${padded}`;
}

export function generateVerificationToken(): string {
  const webCrypto = globalThis.crypto;

  if (webCrypto && typeof webCrypto.randomUUID === "function") {
    return webCrypto.randomUUID().replace(/-/g, "");
  }

  const bytes = new Uint8Array(24);
  if (webCrypto && typeof webCrypto.getRandomValues === "function") {
    webCrypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function buildCertificatePayload(input: {
  certificateNumber: string;
  verificationToken: string;
  issuedAt?: string;
  profile: Pick<Profile, "full_name" | "email">;
  course: Pick<Course, "title" | "slug"> & { product?: { name: string } | null };
  baseUrl?: string;
}): CertificatePayload {
  const base =
    input.baseUrl ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const recipientName =
    input.profile.full_name?.trim() || input.profile.email.split("@")[0];

  return {
    certificateNumber: input.certificateNumber,
    verificationToken: input.verificationToken,
    issuedAt: input.issuedAt ?? new Date().toISOString(),
    recipientName,
    recipientEmail: input.profile.email,
    courseTitle: input.course.title,
    courseSlug: input.course.slug,
    productName: input.course.product?.name,
    verificationUrl: `${base.replace(/\/$/, "")}/verify/${input.certificateNumber}`,
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const int = Number.parseInt(value, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function setFill(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setFillColor(r, g, b);
}

function setStroke(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setDrawColor(r, g, b);
}

function setText(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setTextColor(r, g, b);
}

function getLogoDataUrl(): string | null {
  try {
    const bytes = readFileSync(
      join(process.cwd(), "public/MAXPRO.png"),
    );
    return `data:image/png;base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

function drawWaveBand(
  doc: jsPDF,
  startX: number,
  startY: number,
  segments: number[][],
  count: number,
  spacing: number,
) {
  setStroke(doc, CERTIFICATE_COLORS.wave);
  doc.setLineWidth(0.85);
  doc.setLineCap("round");
  for (let index = 0; index < count; index += 1) {
    doc.lines(segments, startX, startY + index * spacing, [1, 1], "S", false);
  }
}

function drawTemplateDecorations(doc: jsPDF, pageWidth: number, pageHeight: number) {
  setFill(doc, "#FFFFFF");
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  drawWaveBand(
    doc,
    -40,
    188,
    [
      [130, -130, 230, 70, 360, -80],
      [120, -30, 220, 20, 340, 12],
      [90, -20, 160, 8, 250, 6],
    ],
    16,
    1.35,
  );

  setFill(doc, CERTIFICATE_COLORS.navyWave);
  doc.ellipse(120, pageHeight + 8, 210, 95, "F");
  doc.ellipse(pageWidth - 24, pageHeight - 6, 290, 138, "F");
  setFill(doc, CERTIFICATE_COLORS.navyWaveDeep);
  doc.ellipse(55, pageHeight + 20, 150, 72, "F");
  doc.ellipse(pageWidth + 8, pageHeight + 12, 200, 98, "F");
}

function drawAwardRibbon(doc: jsPDF, cx: number, cy: number) {
  setFill(doc, CERTIFICATE_COLORS.ribbon);
  doc.triangle(cx - 10, cy + 12, cx - 22, cy + 62, cx, cy + 40, "F");
  doc.triangle(cx + 10, cy + 12, cx + 22, cy + 62, cx, cy + 40, "F");
  setFill(doc, CERTIFICATE_COLORS.gold);
  doc.circle(cx, cy, 26, "F");
  setFill(doc, CERTIFICATE_COLORS.goldLight);
  doc.circle(cx, cy, 18, "F");
  setFill(doc, CERTIFICATE_COLORS.gold);
  doc.circle(cx, cy, 12, "F");
}

function drawHemantScribble(doc: jsPDF, x: number, y: number) {
  setStroke(doc, CERTIFICATE_COLORS.line);
  doc.setLineWidth(1.4);
  doc.setLineCap("round");
  doc.lines(
    [
      [10, -28, 22, -28, 28, 2],
      [8, -26, 24, -24, 16, 6],
    ],
    x - 28,
    y,
    [1, 1],
    "S",
    false,
  );
}

export function generateCertificatePdf(
  payload: CertificatePayload,
): CertificatePdfResult {
  if (typeof window !== "undefined") {
    throw new Error("generateCertificatePdf must only be called on the server");
  }

  const copy = getCertificateCopy({
    recipientName: payload.recipientName,
    courseTitle: payload.courseTitle,
    issuedAt: payload.issuedAt,
  });

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const center = pageWidth / 2;

  drawTemplateDecorations(doc, pageWidth, pageHeight);

  const logo = getLogoDataUrl();
  if (logo) {
    const logoWidth = 196;
    const logoHeight = Math.round(
      (logoWidth * CERTIFICATE_LOGO_SIZE.height) / CERTIFICATE_LOGO_SIZE.width,
    );
    doc.addImage(logo, "PNG", center - logoWidth / 2, 22, logoWidth, logoHeight);
  } else {
    setText(doc, CERTIFICATE_COLORS.logo);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("MAXPRO", center, 48, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setText(doc, CERTIFICATE_COLORS.muted);
    doc.text("WE MIND YOUR GROWTH", center, 62, { align: "center" });
  }

  setText(doc, CERTIFICATE_COLORS.title);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(42);
  doc.text(copy.heading, center, 122, { align: "center" });
  doc.setFontSize(12);
  doc.text(copy.subheading.split("").join(" "), center, 144, { align: "center" });

  setText(doc, CERTIFICATE_COLORS.body);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text(copy.presentedTo, center, 186, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(36);
  doc.text(copy.recipientName, center, 232, { align: "center" });

  setStroke(doc, CERTIFICATE_COLORS.line);
  doc.setLineWidth(0.7);
  doc.line(center - 150, 242, center + 150, 242);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  setText(doc, CERTIFICATE_COLORS.body);
  const completionLines = doc.splitTextToSize(copy.completionLine, 560);
  doc.text(completionLines, center, 272, { align: "center" });
  const underlineY = 276 + completionLines.length * 16;
  doc.line(center - 90, underlineY, center + 90, underlineY);

  const signatureY = 418;
  drawAwardRibbon(doc, center - 78, signatureY - 8);

  const signX = center + 86;
  drawHemantScribble(doc, signX, signatureY - 6);
  setStroke(doc, CERTIFICATE_COLORS.line);
  doc.setLineWidth(0.7);
  doc.line(signX - 70, signatureY + 10, signX + 70, signatureY + 10);
  setText(doc, CERTIFICATE_COLORS.body);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(CERTIFICATE_SIGNATORY.name, signX, signatureY + 26, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(CERTIFICATE_SIGNATORY.title, signX, signatureY + 40, {
    align: "center",
  });

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  setText(doc, "#FFFFFF");
  doc.text(payload.certificateNumber, 28, pageHeight - 22);

  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBytes = new Uint8Array(pdfArrayBuffer);
  const pdfBase64 = doc.output("datauristring").split(",")[1] ?? "";

  return {
    payload,
    pdfBase64,
    pdfBytes,
  };
}

export function generateCertificate(input: {
  sequence: number;
  profile: Pick<Profile, "full_name" | "email">;
  course: Pick<Course, "title" | "slug"> & { product?: { name: string } | null };
  baseUrl?: string;
}): CertificatePdfResult {
  const certificateNumber = generateCertificateNumber(input.sequence);
  const verificationToken = generateVerificationToken();
  const payload = buildCertificatePayload({
    certificateNumber,
    verificationToken,
    profile: input.profile,
    course: input.course,
    baseUrl: input.baseUrl,
  });

  return generateCertificatePdf(payload);
}

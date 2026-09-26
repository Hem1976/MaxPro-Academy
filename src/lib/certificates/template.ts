export const CERTIFICATE_COLORS = {
  title: "#1A56C4",
  body: "#2A2A2A",
  muted: "#5B6470",
  wave: "#A9D4F0",
  navyWave: "#0B2F6E",
  navyWaveDeep: "#071E4A",
  gold: "#F0C419",
  goldLight: "#FFF4B8",
  ribbon: "#2E6DB4",
  logo: "#00A0C8",
  line: "#1A1A1A",
} as const;

export const CERTIFICATE_LOGO_SRC = "/MAXPRO.png";
export const CERTIFICATE_LOGO_SIZE = { width: 738, height: 210 } as const;

export const CERTIFICATE_SIGNATORY = {
  script: "Hemant Patel",
  name: "Hemant Patel",
  title: "FOUNDER",
} as const;

export const CERTIFICATE_SIGNATORIES = [CERTIFICATE_SIGNATORY] as const;

export interface CertificateCopy {
  heading: string;
  subheading: string;
  presentedTo: string;
  recipientName: string;
  completionLine: string;
  dateLine: string;
  completedOn: string;
  courseTitle: string;
  courseLabel: string;
}

export function formatCertificateDate(issuedAt: string): string {
  const date = new Date(issuedAt);

  if (Number.isNaN(date.getTime())) {
    return issuedAt;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatCertificateCourseLabel(courseTitle: string): string {
  const trimmed = courseTitle.trim() || "course";
  if (/\bcourse\b/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed} course`;
}

export function getCertificateCopy(input: {
  recipientName: string;
  courseTitle: string;
  issuedAt: string;
}): CertificateCopy {
  const recipientName = input.recipientName.trim() || "Learner";
  const courseTitle = input.courseTitle.trim() || "course";
  const courseLabel = formatCertificateCourseLabel(courseTitle);
  const completedOn = formatCertificateDate(input.issuedAt);

  return {
    heading: "CERTIFICATE",
    subheading: "OF COMPLETION",
    presentedTo: "This certificate is proudly presented  to",
    recipientName,
    completionLine: `for successfully completing the ${courseLabel} on ${completedOn}`,
    dateLine: `on ${completedOn}`,
    completedOn,
    courseTitle,
    courseLabel,
  };
}

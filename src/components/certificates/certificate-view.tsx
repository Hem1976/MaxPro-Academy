import Image from "next/image";
import { Great_Vibes, Montserrat } from "next/font/google";
import QRCode from "qrcode";
import { absoluteUrl } from "@/lib/utils";
import {
  CERTIFICATE_LOGO_SIZE,
  CERTIFICATE_LOGO_SRC,
  CERTIFICATE_SIGNATORY,
  getCertificateCopy,
} from "@/lib/certificates/template";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

export interface CertificateViewProps {
  recipientName: string;
  courseTitle: string;
  productName?: string | null;
  issuedAt: string;
  certificateNumber: string;
  verificationToken: string;
}

function CertificateDecorations() {
  const ribbon =
    "M-90 318 C 40 140, 170 290, 330 128 S 560 36, 730 88 S 900 18, 1140 72";

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 707"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g fill="none" stroke="#C5E6F8" strokeLinecap="round">
        {Array.from({ length: 18 }, (_, index) => (
          <path
            key={index}
            d={ribbon}
            transform={`translate(0 ${index * 2.05})`}
            strokeWidth="0.95"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      <path
        d="M0 707 L0 598 C 70 518, 160 505, 250 548 C 340 590, 430 655, 530 668 C 660 684, 780 548, 1000 538 L1000 707 Z"
        fill="#0B2F6E"
      />
      <path
        d="M0 707 L0 638 C 80 568, 175 562, 265 598 C 360 636, 455 678, 555 688 C 690 700, 820 600, 1000 586 L1000 707 Z"
        fill="#071E4A"
      />
    </svg>
  );
}

function AwardRibbon() {
  return (
    <svg viewBox="0 0 90 128" className="h-[6.6rem] w-[4.7rem]" aria-hidden="true">
      <path d="M33 64 L12 124 L45 96 L78 124 L57 64 Z" fill="#2F74C8" />
      <path d="M38 64 L45 96 L52 64 Z" fill="#1E4F9C" />
      <circle cx="45" cy="40" r="38" fill="#F4C430" />
      <circle cx="45" cy="40" r="29" fill="#FFF3B0" />
      <circle cx="45" cy="40" r="22" fill="#F4C430" />
    </svg>
  );
}

function HemantSignatureMark() {
  return (
    <svg
      viewBox="0 0 150 58"
      className="mx-auto h-12 w-[7.8rem]"
      aria-hidden="true"
    >
      <path
        d="M28 46 C 32 8, 48 6, 52 40 C 56 12, 78 4, 86 32 C 90 18, 102 20, 96 38"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export async function CertificateView({
  recipientName,
  courseTitle,
  issuedAt,
  certificateNumber,
  verificationToken,
}: CertificateViewProps) {
  const copy = getCertificateCopy({
    recipientName,
    courseTitle,
    issuedAt,
  });
  const verifyUrl = absoluteUrl(`/verify/${certificateNumber}`);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 0,
    width: 64,
    color: { dark: "#071E4A", light: "#FFFFFF" },
  });

  return (
    <div
      id="maxpro-certificate"
      className={`${montserrat.className} relative w-full overflow-hidden bg-white text-[#1a1a1a] shadow-[0_2px_8px_rgba(63,69,81,0.16)]`}
      style={{ aspectRatio: "297 / 210" }}
    >
      <CertificateDecorations />

      <div className="relative z-10 h-full">
        <div className="absolute left-1/2 top-[4.2%] w-[min(34%,13.5rem)] -translate-x-1/2">
          <Image
            src={CERTIFICATE_LOGO_SRC}
            alt="Maxpro — We mind your growth"
            width={CERTIFICATE_LOGO_SIZE.width}
            height={CERTIFICATE_LOGO_SIZE.height}
            className="mx-auto h-auto w-full"
            style={{ height: "auto" }}
            priority
          />
        </div>

        <h1 className="absolute left-1/2 top-[15.4%] w-full -translate-x-1/2 text-center text-[clamp(2.35rem,6.8vw,4.05rem)] font-extrabold leading-none tracking-tight text-[#1B56C5]">
          {copy.heading}
        </h1>
        <p className="absolute left-1/2 top-[27.4%] w-full -translate-x-1/2 text-center text-[clamp(0.95rem,2vw,1.35rem)] font-bold tracking-[0.22em] text-[#1B56C5]">
          {copy.subheading}
        </p>

        <p className="absolute left-1/2 top-[33.6%] w-full -translate-x-1/2 text-center text-[clamp(0.84rem,1.55vw,1.1rem)] text-[#222222]">
          {copy.presentedTo}
        </p>

        <p
          className={`${greatVibes.className} absolute left-1/2 top-[38%] w-[82%] -translate-x-1/2 text-center text-[clamp(2.3rem,6.3vw,3.75rem)] leading-none text-[#1A4FA0]`}
        >
          {copy.recipientName}
        </p>
        <div className="absolute left-1/2 top-[49.6%] h-px w-[min(54%,21rem)] -translate-x-1/2 bg-[#1A1A1A]" />

        <p className="absolute left-1/2 top-[52.6%] w-[78%] -translate-x-1/2 text-center text-[clamp(0.8rem,1.45vw,1.05rem)] text-[#222222]">
          {copy.completionLine}
        </p>
        <div className="absolute left-1/2 top-[57.6%] h-px w-[min(20%,7.5rem)] -translate-x-1/2 bg-[#1A1A1A]" />

        <div className="absolute left-1/2 top-[59.2%] flex -translate-x-[46%] items-end gap-16 sm:gap-[4.5rem]">
          <AwardRibbon />
          <div className="min-w-[10rem] pb-2 text-center">
            <HemantSignatureMark />
            <div className="mx-auto h-px w-[8.5rem] bg-[#1A1A1A]" />
            <p className="mt-1.5 text-[clamp(0.74rem,1.2vw,0.95rem)] font-bold text-[#1A1A1A]">
              {CERTIFICATE_SIGNATORY.name}
            </p>
            <p className="text-[clamp(0.52rem,0.9vw,0.66rem)] font-semibold uppercase tracking-[0.16em] text-[#1A1A1A]">
              {CERTIFICATE_SIGNATORY.title}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.6%] left-[3.2%] z-10 flex items-center gap-1.5">
        <img
          src={qrDataUrl}
          alt=""
          width={28}
          height={28}
          className="size-7 rounded-[2px] bg-white p-0.5"
        />
        <p className="max-w-[9rem] truncate font-mono text-[8px] text-white/85">
          {certificateNumber}
        </p>
      </div>
      <span className="sr-only">
        Verification token {verificationToken}. Verify at {verifyUrl}
      </span>
    </div>
  );
}

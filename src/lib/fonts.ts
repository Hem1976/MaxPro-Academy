import { IBM_Plex_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";

/** Primary UI & long-form reading — enterprise standard for dashboards and LMS content */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Headings & marketing emphasis — modern, professional SaaS tone */
export const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["500", "600", "700"],
});

/** Certificate numbers, IDs, keyboard hints, admin code fields */
export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const fontVariables = `${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`;

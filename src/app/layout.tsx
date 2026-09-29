import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toast";
import { SITE_CONFIG } from "@/lib/config/site";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s · ${SITE_CONFIG.name}`,
  },
  description:
    "Professional training for Maxpro Infotech solutions — Rockey, RocketSales, RocketVan, and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}

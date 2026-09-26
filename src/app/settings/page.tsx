import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LifeBuoy } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Settings | Maxpro Academy",
};

export default function SettingsPage() {
  return (
    <AppShell>
      <Container className="max-w-2xl py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-navy">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Account preferences and support options.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground">Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Reset your password via email.
            </p>
            <Link href="/forgot-password" className="mt-4 inline-block">
              <Button variant="outline">Reset password</Button>
            </Link>
          </section>

          <ThemeToggle />

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <LifeBuoy className="size-4" aria-hidden="true" />
              Support
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  Help center
                  <ExternalLink className="size-3.5" />
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.supportEmail}`}
                  className="text-accent hover:underline"
                >
                  {SITE_CONFIG.supportEmail}
                </a>
              </li>
              <li>
                <a
                  href="https://maxproinfotech.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  Maxpro Infotech
                  <ExternalLink className="size-3.5" />
                </a>
              </li>
            </ul>
          </section>
        </div>
      </Container>
    </AppShell>
  );
}

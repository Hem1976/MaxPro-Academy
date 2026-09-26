import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";

export interface BrandedLayoutProps {
  children: React.ReactNode;
  logoHref?: string;
}

/** Logo header + site footer for pages outside AppShell / MarketingShell. */
export function BrandedLayout({
  children,
  logoHref = "/",
}: BrandedLayoutProps) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <Container className="flex h-16 items-center">
          <Logo variant="academy" href={logoHref} priority />
        </Container>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

const FOOTER_LINKS: FooterLink[] = [
  { href: "/products", label: "Solutions" },
  { href: "/courses", label: "Courses" },
  { href: "/certificates", label: "Certificates" },
  { href: "/help", label: "Help" },
  {
    href: "mailto:helpdesk@maxproinfotech.com",
    label: "Support",
    external: true,
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <Container className="py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Logo variant="academy" href="/" className="max-h-10" />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Official product training for Maxpro Infotech software.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Maxpro Infotech
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"
            aria-label="Footer"
          >
            {FOOTER_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </Container>
    </footer>
  );
}

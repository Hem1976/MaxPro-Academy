import { MarketingShell } from "@/components/layout/marketing-shell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingShell>{children}</MarketingShell>;
}

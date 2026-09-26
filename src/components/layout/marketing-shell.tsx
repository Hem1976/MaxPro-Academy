import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader user={user?.profile ?? null} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

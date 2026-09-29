import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";

export async function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const isLearner = Boolean(user && !canAccessAdmin(user.profile.role));

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader user={user?.profile ?? null} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter size={isLearner ? "learner" : "default"} />
    </div>
  );
}

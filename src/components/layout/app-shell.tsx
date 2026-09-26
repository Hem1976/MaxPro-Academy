import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";
import { redirect } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (canAccessAdmin(user.profile.role)) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader user={user.profile} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login?next=/admin/dashboard");
  }

  if (!canAccessAdmin(user.profile.role)) {
    redirect("/dashboard");
  }

  const displayName =
    user.profile.full_name?.trim() || user.email.split("@")[0];

  return (
    <div className="flex min-h-full flex-col bg-surface">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Logo variant="academy" href="/admin/dashboard" priority />
          <span className="rounded-md bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent">
            Admin
          </span>
          <span className="hidden truncate text-sm text-muted-foreground sm:inline">
            {displayName}
          </span>
          <AdminSignOutButton />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 lg:grid-cols-[220px_1fr] sm:px-6">
        <aside className="hidden lg:block">
          <div className="sticky top-8 rounded-lg border border-border bg-card p-4">
            <AdminNav />
          </div>
        </aside>

        <main className="min-w-0 rounded-lg border border-border bg-card p-6 sm:p-8">
          {children}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}

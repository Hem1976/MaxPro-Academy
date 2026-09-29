import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { Logo } from "@/components/brand/logo";
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
    <div className="flex min-h-screen w-full flex-col bg-surface">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="flex h-14 w-full items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Logo variant="academy" href="/admin/dashboard" priority />
          <span className="rounded-md bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent">
            Admin
          </span>
          <span className="hidden truncate text-sm text-muted-foreground sm:inline">
            {displayName}
          </span>
          <AdminSignOutButton />
        </div>
      </header>

      <div className="flex w-full flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
            <AdminNav />
          </div>
        </aside>

        <main className="min-w-0 w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

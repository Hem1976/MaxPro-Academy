import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/lib/auth/get-user";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  return (
    <div className="flex min-h-full flex-col bg-surface">
      <SiteHeader user={user.profile} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

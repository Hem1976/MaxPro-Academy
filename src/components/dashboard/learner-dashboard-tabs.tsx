import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LearnerDashboardView } from "@/lib/dashboard/learner-dashboard-page";

const TABS: { href: string; label: string; view: LearnerDashboardView }[] = [
  { href: "/dashboard", label: "Home", view: "home" },
  { href: "/my-learning", label: "My Learning", view: "learning" },
];

export function LearnerDashboardTabs({
  activeView,
}: {
  activeView: LearnerDashboardView;
}) {
  return (
    <nav
      className="mt-5 flex w-full max-w-md gap-1 rounded-lg border border-white/10 bg-white/5 p-1 sm:mt-6"
      aria-label="Dashboard"
    >
      {TABS.map((tab) => {
        const isActive = tab.view === activeView;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors focus-ring",
              isActive
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

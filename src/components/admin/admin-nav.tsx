"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  FileText,
  HeartPulse,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Home",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Stats", icon: BarChart3 },
    ],
  },
  {
    label: "Build",
    items: [
      { href: "/admin/solutions", label: "Solutions", icon: Package },
      { href: "/admin/courses", label: "Courses", icon: BookOpen },
      {
        href: "/admin/ai-course-builder",
        label: "AI builder",
        icon: Sparkles,
      },
      { href: "/admin/lessons", label: "Lessons", icon: FileText },
      { href: "/admin/quizzes", label: "Quizzes", icon: HelpCircle },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      {
        href: "/admin/external-users",
        label: "Import users",
        icon: UserPlus,
      },
      { href: "/admin/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    label: "More",
    items: [
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      {
        href: "/admin/content-health",
        label: "Fix content",
        icon: HeartPulse,
      },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6" aria-label="Admin navigation">
      <div className="flex items-center gap-2 px-3">
        <Shield className="size-4 text-accent" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">Menu</span>
      </div>

      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent-muted text-accent"
                        : "text-muted-foreground hover:bg-surface hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="border-t border-border pt-4">
        <p className="px-3 text-xs text-muted-foreground">
          Staff only. Learners sign in elsewhere.
        </p>
      </div>
    </nav>
  );
}

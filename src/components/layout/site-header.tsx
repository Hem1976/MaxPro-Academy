"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Shield } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { IconButton } from "@/components/ui/icon-button";
import { useSearchDialog } from "@/components/shared/search-dialog";
import { SearchTrigger, SiteSearch } from "@/components/layout/site-search";
import { canAccessAdmin } from "@/lib/auth/roles";
import { learnerShellClassName } from "@/components/layout/learner-page";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";
import { useState, useTransition } from "react";

const AUTH_NAV_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/my-learning", label: "My Learning" },
  { href: "/products", label: "Solutions" },
  { href: "/courses", label: "Courses" },
];

interface SiteHeaderProps {
  user?: Pick<Profile, "full_name" | "email" | "avatar_url" | "role"> | null;
}

export function SiteHeader({ user = null }: SiteHeaderProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { open: searchOpen, setOpen: setSearchOpen } = useSearchDialog();
  const [isSigningOut, startSignOut] = useTransition();
  const showAdmin = user ? canAccessAdmin(user.role) : false;
  const displayName =
    user?.full_name?.trim() || user?.email?.split("@")[0] || "";
  const homeHref = showAdmin ? "/admin/dashboard" : user ? "/dashboard" : "/";
  const headerShellClass =
    user && !showAdmin ? learnerShellClassName() : "container-max";

  const handleSignOut = () => {
    startSignOut(async () => {
      await signOut(showAdmin ? "admin" : "learner");
    });
  };

  const isNavActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className={cn(headerShellClass, "flex h-16 items-center gap-4")}>
          <IconButton
            label="Open navigation"
            variant="ghost"
            className="md:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-5" />
          </IconButton>

          <Logo variant="academy" href={homeHref} className="shrink-0" priority />

          {user && !showAdmin && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {AUTH_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isNavActive(link.href)
                      ? "bg-accent-muted text-accent"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                {!showAdmin && (
                  <SearchTrigger onClick={() => setSearchOpen(true)} />
                )}
                {showAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-accent hover:bg-accent-muted"
                  >
                    <Shield className="size-3.5" />
                    Admin console
                  </Link>
                )}
                {/* Notifications stub — hidden until implemented */}
                <Dropdown
                  align="end"
                  trigger={
                    <button
                      type="button"
                      className="focus-ring flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-surface"
                      aria-label="Account menu"
                    >
                      <Avatar
                        src={user.avatar_url}
                        name={displayName}
                        size="sm"
                      />
                      <span className="hidden max-w-[8rem] truncate text-sm font-medium text-foreground lg:inline">
                        {displayName}
                      </span>
                    </button>
                  }
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownSeparator />
                  <DropdownItem
                    onClick={() => {
                      window.location.href = showAdmin
                        ? "/admin/settings"
                        : "/profile";
                    }}
                  >
                    {showAdmin ? "Settings" : "Profile"}
                  </DropdownItem>
                  {!showAdmin && (
                    <DropdownItem
                      onClick={() => {
                        window.location.href = "/settings";
                      }}
                    >
                      Settings
                    </DropdownItem>
                  )}
                  <DropdownSeparator />
                  <DropdownItem
                    destructive
                    onClick={isSigningOut ? undefined : handleSignOut}
                  >
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </DropdownItem>
                </Dropdown>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                >
                  Learner sign in
                </Link>
                <Link
                  href="/admin/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                >
                  Staff
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent-hover"
                >
                  Explore courses
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {user && !showAdmin ? (
        <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      ) : null}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Navigation"
      >
        <nav className="flex flex-col gap-1">
          {user && !showAdmin ? (
            <>
              {AUTH_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isNavActive(link.href)
                      ? "bg-accent-muted text-accent"
                      : "text-foreground hover:bg-surface",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  setSearchOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
              >
                <Search className="size-4" aria-hidden="true" />
                Search
              </button>
            </>
          ) : user && showAdmin ? (
            <Link
              href="/admin/dashboard"
              onClick={() => setDrawerOpen(false)}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
            >
              <Shield className="size-4" />
              Admin console
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setDrawerOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
              >
                Learner sign in
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setDrawerOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
              >
                Staff sign in
              </Link>
              <Link
                href="/courses"
                onClick={() => setDrawerOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
              >
                Explore courses
              </Link>
            </>
          )}
          <div className="mt-4 border-t border-border pt-4">
            {user ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </Button>
            ) : (
              <Link
                href="/signup"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-medium hover:bg-surface"
              >
                Create account
              </Link>
            )}
          </div>
        </nav>
      </Drawer>
    </>
  );
}

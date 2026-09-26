import { canAccessAdmin } from "@/lib/auth/roles";
import type { UserRole } from "@/types/database";

export type AuthPortal = "learner" | "admin";

export function isStaffRole(role: UserRole | null | undefined): boolean {
  return canAccessAdmin(role);
}

export function portalMismatchMessage(portal: AuthPortal): string {
  return portal === "admin"
    ? "This sign-in is for academy staff only. Learners should use the learner sign-in."
    : "Staff accounts use the admin sign-in. Learners should sign in here.";
}

export function canUsePortal(
  role: UserRole | null | undefined,
  portal: AuthPortal,
): boolean {
  const staff = isStaffRole(role);
  return portal === "admin" ? staff : !staff;
}

export function safeLearnerNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  if (next.startsWith("/admin") || next.startsWith("/login") || next.startsWith("/signup")) {
    return "/dashboard";
  }
  return next;
}

export function safeAdminNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("/admin/login")) {
    return "/admin/dashboard";
  }
  return next;
}

export function homeForRole(role: UserRole | null | undefined): string {
  return isStaffRole(role) ? "/admin/dashboard" : "/dashboard";
}

export function loginForRole(role: UserRole | null | undefined): string {
  return isStaffRole(role) ? "/admin/login" : "/login";
}

export function loginForPath(pathname: string): string {
  return pathname === "/admin" || pathname.startsWith("/admin/")
    ? "/admin/login"
    : "/login";
}

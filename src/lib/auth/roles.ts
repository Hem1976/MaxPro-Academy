import type { Profile, UserRole } from "@/types/database";

const STAFF_ROLES: UserRole[] = ["trainer", "content_admin", "super_admin"];
const ADMIN_ROLES: UserRole[] = ["content_admin", "super_admin"];
const ADMIN_ACCESS_ROLES: UserRole[] = [
  "trainer",
  "content_admin",
  "super_admin",
];

export function isStaff(role: UserRole | null | undefined): boolean {
  return role != null && STAFF_ROLES.includes(role);
}

export function isAdmin(role: UserRole | null | undefined): boolean {
  return role != null && ADMIN_ROLES.includes(role);
}

export function isSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === "super_admin";
}

export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  return role != null && ADMIN_ACCESS_ROLES.includes(role);
}

export function staffRoleLabel(role: UserRole | null | undefined): string {
  switch (role) {
    case "super_admin":
      return "Super admin";
    case "content_admin":
      return "Content admin";
    case "trainer":
      return "Trainer";
    case "customer":
      return "Learner";
    default:
      return "Unknown";
  }
}

export function getRoleFromProfile(
  profile: Pick<Profile, "role"> | null | undefined,
): UserRole | null {
  return profile?.role ?? null;
}

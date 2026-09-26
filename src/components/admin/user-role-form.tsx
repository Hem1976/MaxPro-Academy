"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/actions/admin";
import { Select } from "@/components/ui/select";
import type { UserRole } from "@/types/database";

interface UserRoleFormProps {
  userId: string;
  currentRole: UserRole;
}

const ROLES: UserRole[] = [
  "customer",
  "trainer",
  "content_admin",
  "super_admin",
];

export function UserRoleForm({ userId, currentRole }: UserRoleFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const role = event.target.value as UserRole;
    startTransition(async () => {
      const result = await updateUserRole(userId, role);
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <Select
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={isPending}
        aria-label="User role"
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {role.replace("_", " ")}
          </option>
        ))}
      </Select>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

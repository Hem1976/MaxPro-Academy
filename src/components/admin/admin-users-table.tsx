"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRoleForm } from "@/components/admin/user-role-form";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import type { DemoUserSession } from "@/lib/data/demo-store";

interface AdminUsersTableProps {
  users: DemoUserSession[];
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const [query, setQuery] = useState("");

  const filtered = users.filter((user) => {
    const haystack = `${user.full_name} ${user.email} ${user.role}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <>
      <div className="mb-4 max-w-md">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email…"
          aria-label="Search users"
        />
      </div>

      <DataTable
        data={filtered}
        keyExtractor={(row) => row.id}
        emptyMessage="No users match your search."
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (row) => (
              <Link
                href={`/admin/users/${row.id}`}
                className="font-medium text-foreground hover:text-accent hover:underline"
              >
                {row.full_name}
              </Link>
            ),
          },
          {
            key: "email",
            header: "Email",
            hideOnMobile: true,
            cell: (row) => row.email,
          },
          {
            key: "company",
            header: "Company",
            hideOnMobile: true,
            cell: (row) => row.company ?? "—",
          },
          {
            key: "role",
            header: "Role",
            cell: (row) => (
              <UserRoleForm userId={row.id} currentRole={row.role} />
            ),
          },
          {
            key: "analytics",
            header: "",
            cell: (row) => (
              <Link
                href={`/admin/users/${row.id}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                Analytics
              </Link>
            ),
          },
        ]}
      />
    </>
  );
}

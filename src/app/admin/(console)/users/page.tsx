import type { Metadata } from "next";
import { AdminButtonLink } from "@/components/admin/admin-button-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { getAllDemoUsers } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Users | Admin",
};

export default function AdminUsersPage() {
  const users = getAllDemoUsers();

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Users"
        description="Find people, change roles, and see their progress."
      >
        <AdminButtonLink href="/admin/external-users">Import CSV</AdminButtonLink>
      </AdminPageHeader>

      <AdminUsersTable users={users} />
    </div>
  );
}

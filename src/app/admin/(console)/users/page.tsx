import type { Metadata } from "next";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { getAllDemoUsers } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Users | Admin",
};

export default function AdminUsersPage() {
  const users = getAllDemoUsers();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-navy">Users</h1>
        <p className="text-sm text-muted-foreground">
          Search learners, update roles, and open each user to see course
          progress. Staff and learners use separate sign-in pages.{" "}
          <a
            href="/admin/external-users"
            className="font-medium text-accent hover:underline"
          >
            Import external learners (CSV)
          </a>
        </p>
      </div>

      <AdminUsersTable users={users} />
    </div>
  );
}

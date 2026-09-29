import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ExternalUsersImport } from "@/components/admin/external-users-import";

export const metadata: Metadata = {
  title: "External learners | Admin",
};

export default function AdminExternalUsersPage() {
  return (
    <div className="w-full">
      <AdminPageHeader
        title="Import users"
        description="Upload a CSV to create accounts and email logins."
      />

      <ExternalUsersImport />
    </div>
  );
}

import type { Metadata } from "next";
import { ExternalUsersImport } from "@/components/admin/external-users-import";

export const metadata: Metadata = {
  title: "External learners | Admin",
};

export default function AdminExternalUsersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-navy">External learners</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bulk-invite external training participants. Upload a CSV and Maxpro
          Academy will create learner accounts and email temporary passwords.
        </p>
      </div>

      <ExternalUsersImport />
    </div>
  );
}

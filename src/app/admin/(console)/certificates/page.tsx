import type { Metadata } from "next";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import {
  getAllDemoCertificates,
  getCourseById,
  getDemoUserById,
} from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Certificates | Admin",
};

export default function AdminCertificatesPage() {
  const certificates = getAllDemoCertificates();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-navy">Certificates</h1>

      <DataTable
        data={certificates}
        keyExtractor={(row) => row.id}
        emptyMessage="No certificates issued yet."
        columns={[
          {
            key: "number",
            header: "Certificate #",
            cell: (row) => (
              <span className="font-mono text-xs">{row.certificate_number}</span>
            ),
          },
          {
            key: "recipient",
            header: "Recipient",
            cell: (row) => {
              const user = getDemoUserById(row.user_id);
              return user?.full_name ?? user?.email ?? row.user_id;
            },
          },
          {
            key: "course",
            header: "Course",
            hideOnMobile: true,
            cell: (row) => getCourseById(row.course_id)?.title ?? "—",
          },
          {
            key: "issued",
            header: "Issued",
            hideOnMobile: true,
            cell: (row) =>
              new Date(row.issued_at).toLocaleDateString("en-US"),
          },
          {
            key: "verify",
            header: "Verify",
            cell: (row) => (
              <Link
                href={`/verify/${row.certificate_number}`}
                className="text-accent hover:underline"
                target="_blank"
              >
                Link
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}

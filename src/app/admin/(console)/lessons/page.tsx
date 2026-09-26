import type { Metadata } from "next";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { getAllLessons, getCourseForModuleId } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Lessons | Admin",
};

export default function AdminLessonsPage() {
  const lessons = getAllLessons();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-navy">Lessons</h1>

      <DataTable
        data={lessons}
        keyExtractor={(row) => row.id}
        emptyMessage="No lessons yet."
        columns={[
          {
            key: "title",
            header: "Title",
            cell: (row) => (
              <Link
                href={`/admin/lessons/${row.id}`}
                className="font-medium text-accent hover:underline"
              >
                {row.title}
              </Link>
            ),
          },
          {
            key: "course",
            header: "Course",
            hideOnMobile: true,
            cell: (row) =>
              getCourseForModuleId(row.module_id)?.title ?? "—",
          },
          {
            key: "video",
            header: "Video",
            hideOnMobile: true,
            cell: (row) => (row.video_url ? "Yes" : "Missing"),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <Badge variant={row.published ? "success" : "secondary"}>
                {row.published ? "Published" : "Draft"}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}

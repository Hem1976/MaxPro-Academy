import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCourseKind } from "@/lib/courses/kind";
import { getCourses } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Courses | Admin",
};

export default function AdminCoursesPage() {
  const courses = getCourses({ publishedOnly: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Build and publish training courses.
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="size-4" />
            New course
          </Button>
        </Link>
      </div>

      <DataTable
        data={courses}
        keyExtractor={(row) => row.id}
        emptyMessage="No courses yet."
        columns={[
          {
            key: "title",
            header: "Title",
            cell: (row) => (
              <Link
                href={`/admin/courses/${row.id}`}
                className="font-medium text-accent hover:underline"
              >
                {row.title}
              </Link>
            ),
          },
          {
            key: "type",
            header: "Type",
            hideOnMobile: true,
            cell: (row) =>
              getCourseKind(row) === "external" ? "External" : "Internal",
          },
          {
            key: "product",
            header: "Product",
            hideOnMobile: true,
            cell: (row) => row.product?.name ?? "—",
          },
          {
            key: "level",
            header: "Level",
            hideOnMobile: true,
            cell: (row) => row.level,
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <Badge variant={row.published ? "success" : "secondary"}>
                {row.status}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}

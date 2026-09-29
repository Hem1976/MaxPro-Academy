import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { AdminButtonLink } from "@/components/admin/admin-button-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
    <div className="w-full">
      <AdminPageHeader
        title="Courses"
        description="Pick a course to edit videos, quiz, and publish."
      >
        <Link href="/admin/courses/new">
          <Button size="md">
            <Plus className="size-4" aria-hidden="true" />
            New course
          </Button>
        </Link>
      </AdminPageHeader>

      <DataTable
        data={courses}
        keyExtractor={(row) => row.id}
        emptyMessage="No courses yet."
        columns={[
          {
            key: "title",
            header: "Title",
            cell: (row) => (
              <span className="font-medium text-foreground">{row.title}</span>
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
            header: "Solution",
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
          {
            key: "actions",
            header: "",
            className: "w-[1%] whitespace-nowrap text-right",
            cell: (row) => (
              <AdminButtonLink
                href={`/admin/courses/${row.id}`}
                variant="primary"
                aria-label={`Edit ${row.title}`}
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </AdminButtonLink>
            ),
          },
        ]}
      />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { getContentHealthIssues } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Content Health | Admin",
};

const TYPE_LABELS: Record<string, string> = {
  lesson_no_video: "Missing video",
  course_no_thumbnail: "No thumbnail",
  unpublished_lesson: "Unpublished lesson",
  draft_course: "Draft course",
};

export default function AdminContentHealthPage() {
  const issues = getContentHealthIssues();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-navy">Content health</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Lessons without videos, courses without thumbnails, and other gaps.
      </p>

      <DataTable
        data={issues}
        keyExtractor={(row) => `${row.type}-${row.entityId}`}
        emptyMessage="No content issues detected."
        columns={[
          {
            key: "type",
            header: "Issue",
            cell: (row) => (
              <Badge variant="secondary">
                {TYPE_LABELS[row.type] ?? row.type}
              </Badge>
            ),
          },
          {
            key: "title",
            header: "Item",
            cell: (row) => (
              <Link href={row.href} className="font-medium text-accent hover:underline">
                {row.title}
              </Link>
            ),
          },
          {
            key: "detail",
            header: "Detail",
            hideOnMobile: true,
            cell: (row) => row.detail,
          },
        ]}
      />
    </div>
  );
}

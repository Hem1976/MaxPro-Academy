"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { LearnerAnalyticsSummary } from "@/lib/data/demo-store";

interface LearnerAnalyticsTableProps {
  learners: LearnerAnalyticsSummary[];
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function LearnerAnalyticsTable({ learners }: LearnerAnalyticsTableProps) {
  const [query, setQuery] = useState("");

  const filtered = learners.filter((learner) => {
    const haystack =
      `${learner.fullName} ${learner.email} ${learner.company ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <>
      <div className="mb-4 max-w-md">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search learners by name or email..."
          aria-label="Search learners"
        />
      </div>

      <DataTable
        data={filtered}
        keyExtractor={(row) => row.userId}
        emptyMessage="No learner activity yet. Enrollments will appear here."
        columns={[
          {
            key: "name",
            header: "Learner",
            cell: (row) => (
              <div>
                <Link
                  href={`/admin/users/${row.userId}`}
                  className="font-medium text-foreground hover:text-accent hover:underline"
                >
                  {row.fullName}
                </Link>
                <p className="text-xs text-muted-foreground">{row.email}</p>
              </div>
            ),
          },
          {
            key: "courses",
            header: "Courses",
            cell: (row) => (
              <span>
                {row.enrolledCourses} enrolled
                {row.inProgressCourses > 0
                  ? ` · ${row.inProgressCourses} in progress`
                  : ""}
              </span>
            ),
          },
          {
            key: "completed",
            header: "Completed",
            hideOnMobile: true,
            cell: (row) => row.completedCourses,
          },
          {
            key: "progress",
            header: "Avg. progress",
            cell: (row) =>
              row.enrolledCourses === 0 ? (
                <span className="text-muted-foreground">Not started</span>
              ) : (
                <ProgressBar
                  value={row.averageProgress}
                  showValue
                  size="sm"
                  className="min-w-[8rem]"
                />
              ),
          },
          {
            key: "certs",
            header: "Certificates",
            hideOnMobile: true,
            cell: (row) => row.certificates,
          },
          {
            key: "activity",
            header: "Last activity",
            hideOnMobile: true,
            cell: (row) => formatDate(row.lastActivityAt),
          },
          {
            key: "view",
            header: "",
            cell: (row) => (
              <Link
                href={`/admin/users/${row.userId}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                View
              </Link>
            ),
          },
        ]}
      />
    </>
  );
}

export function LearnerStatusBadge({
  status,
  percent,
}: {
  status: string;
  percent: number;
}) {
  if (status === "completed" || percent >= 100) {
    return <Badge variant="success">Completed</Badge>;
  }
  if (percent > 0) {
    return <Badge variant="warning">In progress</Badge>;
  }
  return <Badge variant="outline">Not started</Badge>;
}

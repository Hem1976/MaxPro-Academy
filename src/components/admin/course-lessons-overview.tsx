import Link from "next/link";
import type { CourseWithModules } from "@/lib/data/demo-store";

interface CourseLessonsOverviewProps {
  detail: CourseWithModules;
}

export function CourseLessonsOverview({ detail }: CourseLessonsOverviewProps) {
  if (detail.modules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No modules yet. Add videos in step 2 to create lessons.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {detail.modules.map((module) => (
        <div
          key={module.id}
          className="rounded-lg border border-border bg-surface/60 p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">{module.title}</h3>
              {module.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.description}
                </p>
              )}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              Order {module.sort_order}
            </span>
          </div>

          <ul className="mt-3 space-y-2">
            {module.lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link
                  href={`/admin/lessons/${lesson.id}`}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-surface focus-ring"
                >
                  <span>{lesson.title}</span>
                  <span className="text-muted-foreground">
                    {lesson.published ? "Published" : "Draft"}
                  </span>
                </Link>
              </li>
            ))}
            {module.lessons.length === 0 && (
              <li className="text-sm text-muted-foreground">
                No lessons in this module yet.
              </li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

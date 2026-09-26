import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModuleForm } from "@/components/admin/module-form";
import { getCourseById, getCourseWithModules } from "@/lib/data/demo-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseModulesPage({ params }: PageProps) {
  const { id } = await params;
  const course = getCourseById(id);
  const detail = getCourseWithModules(id);
  if (!course || !detail) notFound();

  const nextSortOrder =
    detail.modules.reduce((max, m) => Math.max(max, m.sort_order), 0) + 1;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/courses/${id}`}
          className="text-sm text-accent hover:underline"
        >
          ← Back to course
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-navy">
          Modules · {course.title}
        </h1>
        <Link
          href={`/admin/courses/${id}/content`}
          className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
        >
          Upload videos & build quiz →
        </Link>
      </div>

      <div className="mb-8">
        <ModuleForm courseId={id} nextSortOrder={nextSortOrder} />
      </div>

      <div className="space-y-4">
        {detail.modules.map((module) => (
          <section
            key={module.id}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-foreground">{module.title}</h2>
                {module.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {module.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Order {module.sort_order}
              </span>
            </div>

            <ul className="mt-4 space-y-2">
              {module.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/admin/lessons/${lesson.id}`}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-surface"
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
          </section>
        ))}
      </div>
    </div>
  );
}

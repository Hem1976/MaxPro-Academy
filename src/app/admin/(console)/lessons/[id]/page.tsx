import { notFound } from "next/navigation";
import { AdminButtonLink } from "@/components/admin/admin-button-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LessonForm } from "@/components/admin/lesson-form";
import {
  getCourseForModuleId,
  getLessonById,
  getModulesByCourseId,
} from "@/lib/data/demo-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminLessonEditorPage({ params }: PageProps) {
  const { id } = await params;
  const lesson = getLessonById(id);
  if (!lesson) notFound();

  const course = getCourseForModuleId(lesson.module_id);
  const modules = course ? getModulesByCourseId(course.id) : [];

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Edit lesson"
        description={
          course
            ? `${course.title} · ${lesson.slug}`
            : lesson.slug
        }
      >
        {course ? (
          <AdminButtonLink href={`/admin/courses/${course.id}#lessons`}>
            Back to course
          </AdminButtonLink>
        ) : null}
      </AdminPageHeader>

      <div className="grid gap-8 lg:grid-cols-2">
        <LessonForm lesson={lesson} modules={modules} />

        <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-foreground">Preview</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {lesson.description ?? "No description."}
          </p>
          {lesson.written_content && (
            <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-border bg-surface p-4 text-xs text-foreground">
              {lesson.written_content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

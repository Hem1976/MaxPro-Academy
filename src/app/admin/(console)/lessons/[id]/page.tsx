import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-navy">Edit lesson</h1>
        {course && (
          <p className="mb-6 text-sm text-muted-foreground">
            {course.title} · {lesson.slug}
          </p>
        )}
        <LessonForm lesson={lesson} modules={modules} />
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Preview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {lesson.description ?? "No description."}
        </p>
        {lesson.written_content && (
          <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-border bg-card p-4 text-xs text-foreground">
            {lesson.written_content}
          </pre>
        )}
      </div>
    </div>
  );
}

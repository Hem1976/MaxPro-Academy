import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";
import { PublishCourseButton } from "@/components/admin/publish-course-button";
import { Badge } from "@/components/ui/badge";
import { getCourseKind, isExternalCourse } from "@/lib/courses/kind";
import {
  getCourseById,
  getCourseWithModules,
  getProducts,
} from "@/lib/data/demo-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseById(id);
  return { title: course ? `${course.title} | Admin` : "Course | Admin" };
}

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params;
  const course = getCourseById(id);
  if (!course) notFound();

  const products = getProducts({ publishedOnly: false });
  const detail = getCourseWithModules(id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Edit course</h1>
          <p className="text-sm text-muted-foreground">{course.title}</p>
          <Badge variant="secondary" className="mt-2">
            {getCourseKind(course) === "external" ? "External" : "Internal"}
          </Badge>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/courses/${id}/content`}
            className="text-sm font-medium text-accent hover:underline"
          >
            {isExternalCourse(course) ? "Questionnaire" : "Videos & quiz"}
          </Link>
          <Link
            href={`/admin/courses/${id}/modules`}
            className="text-sm font-medium text-accent hover:underline"
          >
            Manage modules
          </Link>
          <Link
            href={`/courses/${course.slug}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            Preview
          </Link>
        </div>
      </div>

      <CourseForm course={course} products={products} />

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Publishing</h2>
        <div className="mt-3">
          <PublishCourseButton
            courseId={course.id}
            isPublished={course.published}
          />
        </div>
      </section>

      {detail && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Modules ({detail.modules.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {detail.modules.map((module) => (
              <li
                key={module.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <span>{module.title}</span>
                <span className="text-muted-foreground">
                  {module.lessons.length} lessons
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

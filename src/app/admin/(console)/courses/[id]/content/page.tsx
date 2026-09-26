import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalQuestionnaireUpload } from "@/components/admin/external-questionnaire-upload";
import { QuizBuilderForm } from "@/components/admin/quiz-builder-form";
import { VideoCourseBuilder } from "@/components/admin/video-course-builder";
import { getCourseKind, isExternalCourse } from "@/lib/courses/kind";
import {
  getCourseById,
  getCourseQuizWithQuestions,
  getCourseWithModules,
} from "@/lib/data/demo-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseById(id);
  return {
    title: course
      ? `Videos & quiz · ${course.title} | Admin`
      : "Course content | Admin",
  };
}

export default async function CourseContentPage({ params }: PageProps) {
  const { id } = await params;
  const course = getCourseById(id);
  const detail = getCourseWithModules(id);
  if (!course || !detail) notFound();

  const nextModuleSortOrder =
    detail.modules.reduce((max, module) => Math.max(max, module.sort_order), 0) +
    1;

  const lessonCount = detail.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0,
  );

  const existingQuiz = getCourseQuizWithQuestions(id);
  const external = isExternalCourse(course);
  const kindLabel = getCourseKind(course) === "external" ? "External" : "Internal";

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
          {external ? "Questionnaire" : "Videos & quiz"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {course.title} · {kindLabel} course
        </p>
      </div>

      {external ? (
        <div className="space-y-8">
          <ExternalQuestionnaireUpload
            courseId={course.id}
            hasExistingQuiz={Boolean(existingQuiz)}
          />
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-foreground">
              Or build manually
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create questions in the admin UI instead of uploading JSON.
            </p>
            <div className="mt-4">
              <QuizBuilderForm
                courseId={course.id}
                hasExistingQuiz={Boolean(existingQuiz)}
                lessonCount={lessonCount > 0 ? lessonCount : 1}
              />
            </div>
          </section>
        </div>
      ) : (
        <VideoCourseBuilder
          course={course}
          modules={detail.modules}
          nextModuleSortOrder={nextModuleSortOrder}
          hasExistingQuiz={Boolean(existingQuiz)}
          lessonCount={lessonCount}
        />
      )}
    </div>
  );
}

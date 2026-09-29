import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminButtonLink } from "@/components/admin/admin-button-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BuilderSection } from "@/components/admin/builder-section";
import { CourseForm } from "@/components/admin/course-form";
import { CourseLessonsOverview } from "@/components/admin/course-lessons-overview";
import { ExternalQuestionnaireUpload } from "@/components/admin/external-questionnaire-upload";
import { PublishCourseButton } from "@/components/admin/publish-course-button";
import { QuizBuilderForm } from "@/components/admin/quiz-builder-form";
import { VideoCourseBuilder } from "@/components/admin/video-course-builder";
import { Badge } from "@/components/ui/badge";
import { getCourseKind, isExternalCourse } from "@/lib/courses/kind";
import {
  getCourseById,
  getCourseQuizWithQuestions,
  getCourseWithModules,
  getProducts,
} from "@/lib/data/demo-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseById(id);
  return {
    title: course
      ? `Build course · ${course.title} | Admin`
      : "Course | Admin",
  };
}

export default async function CourseBuilderPage({ params }: PageProps) {
  const { id } = await params;
  const course = getCourseById(id);
  if (!course) notFound();

  const products = getProducts({ publishedOnly: false });
  const detail = getCourseWithModules(id);
  if (!detail) notFound();

  const nextModuleSortOrder =
    detail.modules.reduce((max, module) => Math.max(max, module.sort_order), 0) +
    1;

  const lessonCount = detail.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0,
  );

  const existingQuiz = getCourseQuizWithQuestions(id);
  const external = isExternalCourse(course);

  return (
    <div className="w-full space-y-8 pb-6">
      <AdminPageHeader
        title={course.title}
        description={
          <>
            <span className="mt-1 inline-flex">
              <Badge variant="secondary">
                {getCourseKind(course) === "external" ? "External" : "Internal"}
              </Badge>
            </span>
            <span className="mt-2 block">
              Work through the steps below, then publish.
            </span>
          </>
        }
      >
        <AdminButtonLink href={`/courses/${course.slug}`}>
          Preview
          <ExternalLink className="size-4" aria-hidden="true" />
        </AdminButtonLink>
      </AdminPageHeader>

      <BuilderSection
        step={1}
        id="details"
        title="Details"
        description="Name, solution, level, and description."
      >
        <CourseForm course={course} products={products} />
      </BuilderSection>

      {external ? (
        <BuilderSection
          step={2}
          id="content"
          title="Quiz"
          description="Upload a file or add questions by hand."
        >
          <div className="space-y-8">
            <ExternalQuestionnaireUpload
              courseId={course.id}
              hasExistingQuiz={Boolean(existingQuiz)}
            />
            <div className="rounded-lg border border-border bg-surface/60 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Or add questions here
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No file needed.
              </p>
              <div className="mt-4">
                <QuizBuilderForm
                  courseId={course.id}
                  hasExistingQuiz={Boolean(existingQuiz)}
                  lessonCount={lessonCount > 0 ? lessonCount : 1}
                />
              </div>
            </div>
          </div>
        </BuilderSection>
      ) : (
        <BuilderSection
          step={2}
          id="videos"
          title="Videos & quiz"
          description="Upload videos, sort into modules, add a final quiz."
        >
          <VideoCourseBuilder
            course={course}
            modules={detail.modules}
            nextModuleSortOrder={nextModuleSortOrder}
            hasExistingQuiz={Boolean(existingQuiz)}
            lessonCount={lessonCount}
          />
        </BuilderSection>
      )}

      <BuilderSection
        step={3}
        id="lessons"
        title="Lessons"
        description="Tap a lesson to edit title, video, or notes."
      >
        <CourseLessonsOverview detail={detail} />
      </BuilderSection>

      <BuilderSection
        step={4}
        id="publish"
        title="Publish"
        description="When ready, publish so learners can join."
      >
        <PublishCourseButton
          courseId={course.id}
          isPublished={course.published}
        />
      </BuilderSection>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LearnerPage } from "@/components/layout/learner-page";
import { LessonWorkspace } from "@/components/lesson/lesson-workspace";
import type { SidebarModule } from "@/components/lesson/course-sidebar";
import { enrollInCourse } from "@/actions/progress";
import { getCurrentUser } from "@/lib/auth/get-user";
import {
  getAdjacentLessons,
  getCourseProgress,
  getCourseQuizWithQuestions,
  getCourseWithModules,
  getDemoLessonProgress,
  getLessonBySlugs,
  hasPassedCourseQuiz,
  updateDemoLesson,
} from "@/lib/data/demo-store";

interface LessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

/** CMS content changes at runtime (AI drafts) — never cache a 404. */
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const lesson = getLessonBySlugs(slug, lessonSlug);

  if (!lesson) {
    return { title: "Lesson not found" };
  }

  return {
    title: lesson.title,
    description: lesson.description ?? `Learn ${lesson.title} on Maxpro Academy.`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonSlug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/courses/${slug}/lesson/${lessonSlug}`,
      )}`,
    );
  }

  const lesson = getLessonBySlugs(slug, lessonSlug);
  const course = getCourseWithModules(slug);

  if (!lesson || !course || !course.published) {
    notFound();
  }

  // Course publish is the learner gate. Older AI drafts left lessons unpublished.
  if (!lesson.published) {
    updateDemoLesson(lesson.id, { published: true });
  }

  await enrollInCourse(course.id);

  const progressSummary = getCourseProgress(user.id, course.id);
  const lessonProgress = getDemoLessonProgress(user.id, lesson.id);
  const { previous, next } = getAdjacentLessons(slug, lessonSlug);

  const progressByLesson = new Map(
    course.modules
      .flatMap((courseModule) => courseModule.lessons)
      .map((item) => [
        item.id,
        getDemoLessonProgress(user.id, item.id)?.completed === true,
      ]),
  );

  const sidebarModules: SidebarModule[] = course.modules.map((courseModule) => ({
    id: courseModule.id,
    title: courseModule.title,
    lessons: courseModule.lessons.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      completed: progressByLesson.get(item.id) === true,
      current: item.slug === lessonSlug,
    })),
  }));

  const courseQuiz = getCourseQuizWithQuestions(course.id);
  const sidebarQuiz = courseQuiz
    ? {
        title: "Quiz",
        completed: hasPassedCourseQuiz(user.id, course.id),
        current: false,
      }
    : null;

  return (
    <AppShell>
      <LearnerPage>
      <LessonWorkspace
        courseId={course.id}
        courseSlug={slug}
        courseTitle={course.title}
        lesson={{
          id: lesson.id,
          title: lesson.title,
          slug: lesson.slug,
          description: lesson.description,
          learning_objective: lesson.learning_objective,
          video_url: lesson.video_url,
          video_provider: lesson.video_provider,
          captions_url: lesson.captions_url,
          duration_seconds: lesson.duration_seconds,
          written_content: lesson.written_content,
          resources: lesson.resources,
        }}
        progress={lessonProgress}
        sidebarModules={sidebarModules}
        sidebarQuiz={sidebarQuiz}
        completedCount={progressSummary.completedRequired}
        totalCount={progressSummary.totalRequired}
        progressPercent={progressSummary.percent}
        nextLesson={next ? { slug: next.slug, title: next.title } : null}
        previousLesson={
          previous ? { slug: previous.slug, title: previous.title } : null
        }
      />
      </LearnerPage>
    </AppShell>
  );
}

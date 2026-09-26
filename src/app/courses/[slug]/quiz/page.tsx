import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { QuizWorkspace } from "@/components/lesson/quiz-workspace";
import type { SidebarModule } from "@/components/lesson/course-sidebar";
import { enrollInCourse } from "@/actions/progress";
import { getCurrentUser } from "@/lib/auth/get-user";
import {
  getCourseProgress,
  getCourseQuizWithQuestions,
  getCourseWithModules,
  getDemoLessonProgress,
  getOrderedLessonsForCourse,
  hasPassedCourseQuiz,
  toLearnerQuiz,
} from "@/lib/data/demo-store";

interface CourseQuizPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: CourseQuizPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseWithModules(slug);
  const quiz = course ? getCourseQuizWithQuestions(course.id) : null;

  if (!course || !quiz) {
    return { title: "Quiz not found" };
  }

  return {
    title: `${quiz.title} | ${course.title}`,
    description: quiz.description ?? `Course quiz for ${course.title}.`,
  };
}

export default async function CourseQuizPage({ params }: CourseQuizPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/courses/${slug}/quiz`)}`);
  }

  const course = getCourseWithModules(slug);
  if (!course || !course.published) {
    notFound();
  }

  const quiz = getCourseQuizWithQuestions(course.id);
  if (!quiz) {
    notFound();
  }

  await enrollInCourse(course.id);

  const progressSummary = getCourseProgress(user.id, course.id);
  const orderedLessons = getOrderedLessonsForCourse(course.id);
  const lastLesson = orderedLessons.at(-1) ?? null;
  const quizPassed = hasPassedCourseQuiz(user.id, course.id);

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
      current: false,
    })),
  }));

  return (
    <AppShell>
      <QuizWorkspace
        courseId={course.id}
        courseSlug={slug}
        courseTitle={course.title}
        quiz={toLearnerQuiz(quiz)}
        alreadyPassed={quizPassed}
        lastLesson={
          lastLesson ? { slug: lastLesson.slug, title: lastLesson.title } : null
        }
        sidebarModules={sidebarModules}
        sidebarQuiz={{
          title: "Quiz",
          completed: quizPassed,
          current: true,
        }}
        completedCount={progressSummary.completedRequired}
        totalCount={progressSummary.totalRequired}
        progressPercent={progressSummary.percent}
      />
    </AppShell>
  );
}

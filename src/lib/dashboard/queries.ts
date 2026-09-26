import {
  getCourseById,
  getCourseProgress,
  getCourseWithModules,
  getCourses,
  getDemoCertificates,
  getDemoEnrollments,
  getNextLearningItemForUser,
  getRecommendedCoursesForUser,
  isSupabaseConfigured,
} from "@/lib/data/demo-store";
import { getCurrentUser } from "@/lib/auth/get-user";
import { summarizeCourseProgress } from "@/lib/progress/calculate";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Course } from "@/types/database";

export interface DashboardCourseItem {
  course: Course;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
}

export interface DashboardData {
  greetingName: string;
  nextLesson: {
    title: string;
    courseTitle: string;
    moduleTitle: string;
    href: string;
    progressPercent: number;
    kind: "lesson" | "quiz";
  } | null;
  myCourses: DashboardCourseItem[];
  recommendedCourses: Course[];
  recentlyCompleted: DashboardCourseItem[];
  certificates: Certificate[];
  certificateCount: number;
}

function statusFromProgress(
  percent: number,
  enrollmentStatus?: string,
): DashboardCourseItem["status"] {
  if (enrollmentStatus === "completed" || percent >= 100) return "completed";
  if (percent > 0) return "in-progress";
  return "not-started";
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const firstName =
    user.profile.full_name?.trim().split(/\s+/)[0] ||
    user.email.split("@")[0];

  if (!isSupabaseConfigured()) {
    const enrollments = getDemoEnrollments(user.id);
    const myCourses: DashboardCourseItem[] = enrollments.map((enrollment) => {
      const course = getCourseById(enrollment.course_id)!;
      const summary = getCourseProgress(user.id, enrollment.course_id);
      return {
        course,
        progress: summary.percent,
        status: statusFromProgress(summary.percent, enrollment.status),
      };
    });

    const recentlyCompleted = myCourses
      .filter((item) => item.status === "completed")
      .slice(0, 3);

    const next = getNextLearningItemForUser(user.id);
    const nextLesson = next
      ? {
          title: next.title,
          courseTitle: next.courseTitle,
          moduleTitle: next.moduleTitle,
          href: next.href,
          progressPercent: getCourseProgress(user.id, next.courseId).percent,
          kind: next.kind,
        }
      : null;

    const certificates = getDemoCertificates(user.id);

    return {
      greetingName: firstName,
      nextLesson,
      myCourses,
      recommendedCourses: getRecommendedCoursesForUser(user.id, 4),
      recentlyCompleted,
      certificates,
      certificateCount: certificates.length,
    };
  }

  const supabase = await createClient();
  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("user_id", user.id);

  const myCourses: DashboardCourseItem[] = [];
  let nextLesson: DashboardData["nextLesson"] = null;

  for (const row of enrollmentRows ?? []) {
    const course = row.courses as Course;
    if (!course) continue;

    const courseDetail = getCourseWithModules(course.id);
    if (!courseDetail) continue;

    const lessons = courseDetail.modules.flatMap((module) => module.lessons);
    const lessonIds = lessons.map((lesson) => lesson.id);

    const { data: progressRows } = lessonIds.length
      ? await supabase
          .from("lesson_progress")
          .select("lesson_id, completed")
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds)
      : { data: [] as Array<{ lesson_id: string; completed: boolean }> };

    const { data: quizRows } = lessonIds.length
      ? await supabase
          .from("quizzes")
          .select("id, lesson_id, required, title")
          .in("lesson_id", lessonIds)
      : { data: [] as Array<{ id: string; lesson_id: string; required: boolean; title: string }> };

    const quizIds = (quizRows ?? []).map((quiz) => quiz.id);
    const { data: attemptRows } = quizIds.length
      ? await supabase
          .from("quiz_attempts")
          .select("quiz_id, passed")
          .eq("user_id", user.id)
          .in("quiz_id", quizIds)
      : { data: [] as Array<{ quiz_id: string; passed: boolean }> };

    const rollup = summarizeCourseProgress({
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        required: lesson.required,
        published: lesson.published,
      })),
      quizzes: (quizRows ?? []).map((quiz) => ({
        id: quiz.id,
        required: quiz.required,
      })),
      completedLessonIds: (progressRows ?? [])
        .filter((progressRow) => progressRow.completed)
        .map((progressRow) => progressRow.lesson_id),
      passedQuizIds: [
        ...new Set(
          (attemptRows ?? [])
            .filter((attempt) => attempt.passed)
            .map((attempt) => attempt.quiz_id),
        ),
      ],
    });

    myCourses.push({
      course,
      progress: rollup.percent,
      status: statusFromProgress(rollup.percent, row.status),
    });

    if (!nextLesson && rollup.nextItem) {
      if (rollup.nextItem.kind === "quiz") {
        const quiz = (quizRows ?? []).find((item) => item.id === rollup.nextItem?.id);
        nextLesson = {
          title: quiz?.title ?? "Course quiz",
          courseTitle: course.title,
          moduleTitle: "Knowledge check",
          href: `/courses/${course.slug}/quiz`,
          progressPercent: rollup.percent,
          kind: "quiz",
        };
      } else {
        for (const courseModule of courseDetail.modules) {
          const lesson = courseModule.lessons.find(
            (item) => item.id === rollup.nextItem?.id,
          );
          if (!lesson) continue;
          nextLesson = {
            title: lesson.title,
            courseTitle: course.title,
            moduleTitle: courseModule.title,
            href: `/courses/${course.slug}/lesson/${lesson.slug}`,
            progressPercent: rollup.percent,
            kind: "lesson",
          };
          break;
        }
      }
    }
  }

  const { data: certRows } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false });

  const preferredIds = user.profile.preferred_product_ids ?? [];
  let recommended = getCourses({ publishedOnly: true });
  if (preferredIds.length) {
    const matched = recommended.filter((c) =>
      preferredIds.includes(c.product_id),
    );
    if (matched.length) recommended = matched;
  }

  const enrolledIds = new Set(myCourses.map((c) => c.course.id));
  recommended = recommended.filter((c) => !enrolledIds.has(c.id)).slice(0, 4);

  const certificates = (certRows ?? []) as Certificate[];

  return {
    greetingName: firstName,
    nextLesson,
    myCourses,
    recommendedCourses: recommended,
    recentlyCompleted: myCourses.filter((c) => c.status === "completed").slice(0, 3),
    certificates,
    certificateCount: certificates.length,
  };
}

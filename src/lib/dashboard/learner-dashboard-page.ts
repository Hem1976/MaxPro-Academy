import { getDashboardData, type DashboardData } from "@/lib/dashboard/queries";
import {
  getCourseBySlugDetailed,
  getPublishedCourses,
  getPublishedProducts,
} from "@/lib/data/queries";
import { greetingForHour } from "@/lib/utils";
import type { Course, Certificate } from "@/types/database";

function courseSlugFromHref(href: string): string | null {
  const match = href.match(/^\/courses\/([^/]+)/);
  return match?.[1] ?? null;
}

export type LearnerDashboardView = "home" | "learning";

export interface LearnerDashboardPageContext {
  greeting: string;
  greetingName: string;
  data: DashboardData;
  startChoices: Course[];
  exploreProducts: ReturnType<typeof getPublishedProducts>;
  continueCourse: ReturnType<typeof getCourseBySlugDetailed> | null;
}

export async function getLearnerDashboardPageContext(): Promise<LearnerDashboardPageContext | null> {
  const data = await getDashboardData();

  if (!data) {
    return null;
  }

  const publishedCourses = getPublishedCourses();
  const startChoices =
    data.recommendedCourses.length > 0
      ? data.recommendedCourses.slice(0, 3)
      : publishedCourses.slice(0, 3);

  const nextLessonCourseSlug = data.nextLesson
    ? courseSlugFromHref(data.nextLesson.href)
    : null;
  const continueCourse = nextLessonCourseSlug
    ? getCourseBySlugDetailed(nextLessonCourseSlug)
    : null;

  return {
    greeting: greetingForHour(),
    greetingName: data.greetingName,
    data,
    startChoices,
    exploreProducts: getPublishedProducts().slice(0, 8),
    continueCourse,
  };
}

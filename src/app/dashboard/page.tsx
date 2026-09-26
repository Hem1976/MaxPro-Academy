import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { LearnerDashboard } from "@/components/dashboard/learner-dashboard";
import { getDashboardData } from "@/lib/dashboard/queries";
import {
  getCourseBySlugDetailed,
  getPublishedCourses,
  getPublishedProducts,
} from "@/lib/data/queries";
import { greetingForHour } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard | Maxpro Academy",
  description: "Your personalized Maxpro Academy learning dashboard.",
};

function courseSlugFromHref(href: string): string | null {
  const match = href.match(/^\/courses\/([^/]+)/);
  return match?.[1] ?? null;
}

export default async function DashboardPage() {
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

  return (
    <AppShell>
      <LearnerDashboard
        greeting={greetingForHour()}
        greetingName={data.greetingName}
        data={data}
        startChoices={startChoices}
        exploreProducts={getPublishedProducts().slice(0, 8)}
        continueCourse={continueCourse}
      />
    </AppShell>
  );
}

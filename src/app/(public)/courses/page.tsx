import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CourseThumbnail } from "@/components/brand/course-thumbnail";
import { Container } from "@/components/ui/container";
import { CourseCard } from "@/components/course/course-card";
import { FadeIn } from "@/components/marketing/fade-in";
import { CourseLevelFilter } from "@/components/marketing/course-level-filter";
import { getOrderedLessonsForCourse } from "@/lib/data/demo-store";
import { getCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";
import { getPublishedCourses } from "@/lib/data/queries";
import { formatMinutes } from "@/lib/utils";
import type { CourseLevel } from "@/types/database";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse Maxpro Academy courses. Filter by level and find structured training for field sales, administration, and operations.",
};

const VALID_LEVELS: CourseLevel[] = ["beginner", "intermediate", "advanced"];

const levelLabels: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

interface CoursesPageProps {
  searchParams: Promise<{ level?: string }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { level } = await searchParams;
  const validLevel =
    level && VALID_LEVELS.includes(level as CourseLevel)
      ? (level as CourseLevel)
      : undefined;

  const courses = getPublishedCourses({ level: validLevel });
  const featuredCourse =
    !validLevel ? courses.find((course) => course.featured) : undefined;
  const gridCourses = featuredCourse
    ? courses.filter((course) => course.id !== featuredCourse.id)
    : courses;

  const user = await getCurrentUser();
  const containerSize =
    user && !canAccessAdmin(user.profile.role) ? "learner" : "default";

  return (
    <Container size={containerSize} className="py-12 lg:py-16">
      <FadeIn>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <header className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
              Courses
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Structured learning paths for Maxpro software. Each course
              includes video lessons, practical guides, and progress tracking.
            </p>
          </header>

          <Suspense fallback={null}>
            <CourseLevelFilter />
          </Suspense>
        </div>
      </FadeIn>

      {featuredCourse && (
        <FadeIn className="mt-12">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Featured
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card lg:grid lg:grid-cols-2">
            <Link
              href={`/courses/${featuredCourse.slug}`}
              className="group block"
            >
              <CourseThumbnail
                productName={featuredCourse.product?.name ?? "Maxpro"}
                courseTitle={featuredCourse.title}
                productCategory={featuredCourse.product?.category}
                imageUrl={featuredCourse.thumbnail_url}
                className="aspect-[16/9] rounded-none lg:aspect-auto lg:h-full lg:min-h-[280px]"
              />
            </Link>
            <div className="flex flex-col justify-center border-t border-border p-6 lg:border-l lg:border-t-0 lg:p-8">
              <p className="text-sm font-medium text-muted">
                {featuredCourse.product?.name}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-navy">
                {featuredCourse.title}
              </h2>
              {featuredCourse.short_description && (
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {featuredCourse.short_description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{levelLabels[featuredCourse.level]}</span>
                <span>{formatMinutes(featuredCourse.estimated_minutes)}</span>
                <span>
                  {getOrderedLessonsForCourse(featuredCourse.id).length} lessons
                </span>
              </div>
              <Link
                href={`/courses/${featuredCourse.slug}`}
                className="mt-6 inline-flex text-sm font-medium text-accent hover:text-accent-hover"
              >
                View course details
              </Link>
            </div>
          </div>
        </FadeIn>
      )}

      {gridCourses.length > 0 ? (
        <div className={featuredCourse ? "mt-12" : "mt-12"}>
          {featuredCourse && (
            <h2 className="mb-6 text-lg font-semibold text-navy">All courses</h2>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridCourses.map((course, index) => (
              <FadeIn key={course.id} delay={index * 0.03}>
                <CourseCard
                  productName={course.product?.name ?? "Maxpro"}
                  productCategory={course.product?.category}
                  title={course.title}
                  description={course.short_description ?? undefined}
                  href={`/courses/${course.slug}`}
                  thumbnailUrl={course.thumbnail_url}
                  level={course.level}
                  durationMinutes={course.estimated_minutes}
                  lessonCount={getOrderedLessonsForCourse(course.id).length}
                  certificateEnabled={course.certificate_enabled}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      ) : !featuredCourse ? (
        <p className="mt-12 text-muted-foreground">
          No courses match this filter.{" "}
          <a href="/courses" className="text-accent hover:text-accent-hover">
            View all courses
          </a>
        </p>
      ) : null}
    </Container>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { ContinueLearningCard } from "@/components/dashboard/continue-learning-card";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StartLearningCard } from "@/components/dashboard/start-learning-card";
import { ProductVisual } from "@/components/brand/product-visual";
import { CourseCard } from "@/components/course/course-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionHeading } from "@/components/ui/section-heading";
import { getOrderedLessonsForCourse } from "@/lib/data/demo-store";
import type { DashboardCourseItem, DashboardData } from "@/lib/dashboard/queries";
import type { Course, Product } from "@/types/database";

export interface LearnerDashboardProps {
  greeting: string;
  greetingName: string;
  data: DashboardData;
  startChoices: Course[];
  exploreProducts: Product[];
  continueCourse?: Course | null;
}

function formatIssuedOn(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function remainingMinutesFor(course: Course | null | undefined, percent: number) {
  if (!course?.estimated_minutes) return null;
  if (percent >= 100) return 0;
  return Math.max(1, Math.round((course.estimated_minutes * (100 - percent)) / 100));
}

function EnrolledCourseTile({ item }: { item: DashboardCourseItem }) {
  const { course, progress, status } = item;
  const productName = course.product?.name ?? "Maxpro";

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md focus-ring"
    >
      <div className="relative">
        <ProductVisual
          name={productName}
          category={course.product?.category}
          imageUrl={course.thumbnail_url ?? course.product?.cover_image_url}
          variant="card"
          className="rounded-none border-0"
        />
        <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-4.5rem)]">
          <Badge
            variant={
              status === "completed"
                ? "success"
                : status === "in-progress"
                  ? "default"
                  : "secondary"
            }
          >
            {status === "completed"
              ? "Completed"
              : status === "in-progress"
                ? "In progress"
                : "Not started"}
          </Badge>
        </div>
        <div className="absolute bottom-2 right-2 z-10 rounded-full bg-card/95 p-1 shadow-sm sm:bottom-3 sm:right-3">
          <ProgressRing
            value={progress}
            size={48}
            strokeWidth={4}
            textClassName="text-[10px] sm:text-[11px]"
            label={`${course.title} progress`}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-muted-foreground">{productName}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold text-foreground group-hover:text-accent">
          {course.title}
        </h3>
        {course.short_description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {course.short_description}
          </p>
        )}
        <div className="mt-auto pt-4">
          <ProgressBar value={progress} size="sm" showValue />
        </div>
      </div>
    </Link>
  );
}

export function LearnerDashboard({
  greeting,
  greetingName,
  data,
  startChoices,
  exploreProducts,
  continueCourse,
}: LearnerDashboardProps) {
  const inProgressCount = data.myCourses.filter(
    (item) => item.status === "in-progress",
  ).length;
  const completedCount = data.myCourses.filter(
    (item) => item.status === "completed",
  ).length;
  const overallProgress =
    data.myCourses.length > 0
      ? Math.round(
          data.myCourses.reduce((sum, item) => sum + item.progress, 0) /
            data.myCourses.length,
        )
      : 0;

  const latestCertificate = [...data.certificates].sort((a, b) =>
    b.issued_at.localeCompare(a.issued_at),
  )[0];
  const latestCertificateCourse = latestCertificate
    ? data.myCourses.find((item) => item.course.id === latestCertificate.course_id)
        ?.course ??
      data.recentlyCompleted.find(
        (item) => item.course.id === latestCertificate.course_id,
      )?.course
    : null;

  const remainingMinutes = remainingMinutesFor(
    continueCourse,
    data.nextLesson?.progressPercent ?? 0,
  );

  const stats = [
    {
      label: "In progress",
      value: String(inProgressCount),
      icon: BookOpen,
    },
    {
      label: "Completed",
      value: String(completedCount),
      icon: CheckCircle2,
    },
    {
      label: "Certificates",
      value: String(data.certificateCount),
      icon: Award,
    },
    {
      label: "Overall",
      value: `${overallProgress}%`,
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-full bg-surface">
      <div className="container-max py-6 sm:py-8 lg:py-10">
        <section className="relative overflow-hidden rounded-2xl bg-navy px-4 py-7 text-navy-foreground sm:px-8 sm:py-9">
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-accent/40 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 right-24 size-72 rounded-full bg-accent-hover/30 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Your learning home
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {greeting}, {greetingName}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/75 sm:text-base">
                {data.nextLesson
                  ? "Your next lesson is ready. Jump back in and keep your Maxpro skills moving."
                  : "Pick a course to start — your dashboard will track every lesson and knowledge check."}
              </p>
            </div>

            <dl className="grid w-full min-w-0 grid-cols-2 gap-1.5 sm:gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3"
                >
                  <dt className="flex min-w-0 items-center gap-1 text-[10px] font-medium uppercase leading-tight text-white/65 sm:gap-1.5 sm:text-[11px] sm:tracking-wider">
                    <stat.icon className="size-3 shrink-0 sm:size-3.5" aria-hidden="true" />
                    <span className="min-w-0 break-words">{stat.label}</span>
                  </dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mt-6">
          {data.nextLesson ? (
            <ContinueLearningCard
              title={data.nextLesson.title}
              courseTitle={data.nextLesson.courseTitle}
              moduleTitle={data.nextLesson.moduleTitle}
              href={data.nextLesson.href}
              progressPercent={data.nextLesson.progressPercent}
              kind={data.nextLesson.kind}
              productName={continueCourse?.product?.name}
              productCategory={continueCourse?.product?.category}
              imageUrl={
                continueCourse?.thumbnail_url ??
                continueCourse?.product?.cover_image_url
              }
              remainingMinutes={remainingMinutes}
            />
          ) : (
            <StartLearningCard courses={startChoices} />
          )}
        </section>

        <section id="my-courses" className="mt-10 scroll-mt-24">
          <SectionHeading
            title="My courses"
            description="Every enrolled course, with item-based progress including knowledge checks."
            action={
              <Link
                href="/courses"
                className="text-sm font-medium text-accent hover:underline"
              >
                Browse catalog
              </Link>
            }
          />
          {data.myCourses.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 items-start gap-5 sm:grid-cols-2 [&>*]:min-w-0">
              {data.myCourses.map((item) => (
                <EnrolledCourseTile key={item.course.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                title="No courses yet"
                description="Courses assigned to your account will appear here."
                icon={<BookOpen />}
                action={
                  <Link href="/courses">
                    <Button variant="outline" size="sm">
                      Browse courses
                    </Button>
                  </Link>
                }
              />
            </div>
          )}
        </section>

        <div className="mt-10 space-y-10">
          {exploreProducts.length > 0 && (
            <section aria-label="Explore solutions">
              <SectionHeading
                title="Explore solutions"
                description="Train on the Maxpro tools your team uses in the field."
                action={
                  <Link
                    href="/products"
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    View all
                  </Link>
                }
              />
              <div
                className="mt-5 -mx-4 flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:-mx-6 sm:gap-2.5 sm:px-6 lg:mx-0 lg:gap-3 lg:overflow-x-visible lg:px-0"
              >
                {exploreProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group w-[6.75rem] min-w-0 shrink-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md focus-ring sm:w-[7.25rem] lg:flex-1 lg:max-w-[9.5rem]"
                  >
                    <ProductVisual
                      name={product.name}
                      category={product.category}
                      imageUrl={product.cover_image_url}
                      variant="thumb"
                      className="aspect-[4/3] rounded-none border-0"
                    />
                    <div className="px-2 py-1.5">
                      <p className="truncate text-[11px] font-semibold leading-tight text-foreground group-hover:text-accent sm:text-xs">
                        {product.name}
                      </p>
                      {product.category && (
                        <p className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground">
                          {product.category}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="h-fit rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-navy text-navy-foreground">
                  <Award className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {data.certificateCount > 0
                      ? `${data.certificateCount} ${data.certificateCount === 1 ? "certificate" : "certificates"} earned`
                      : "Earn your first certificate"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {latestCertificate
                      ? `${latestCertificateCourse?.title ?? "Certificate"} · ${formatIssuedOn(latestCertificate.issued_at)}`
                      : "Complete a certified course and pass the knowledge check to unlock a verifiable Maxpro Academy certificate."}
                  </p>
                </div>
              </div>

              <Link href="/certificates" className="shrink-0 sm:pt-1">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  {data.certificateCount > 0 ? "View certificates" : "How certificates work"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>

            {data.recentlyCompleted.length > 0 && (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {data.recentlyCompleted.map((item) => (
                  <li key={item.course.id}>
                    <Link
                      href={`/courses/${item.course.slug}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface/70 px-3 py-2.5 transition-colors hover:bg-surface focus-ring"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <CheckCircle2
                          className="size-4 shrink-0 text-success"
                          aria-hidden="true"
                        />
                        <span className="truncate text-sm font-medium text-foreground">
                          {item.course.title}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-success">Done</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {data.recommendedCourses.length > 0 && (
          <section className="mt-10 pb-4">
            <SectionHeading
              title="Recommended for you"
              description="Based on your preferred solutions and learning role."
            />
            <div className="mt-5 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.recommendedCourses.map((course) => (
                <CourseCard
                  key={course.id}
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
                  className="shadow-sm hover:shadow-md"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

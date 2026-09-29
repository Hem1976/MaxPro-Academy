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
import { LearnerDashboardTabs } from "@/components/dashboard/learner-dashboard-tabs";
import {
  LearnerPage,
  learnerPageMaxClass,
  learnerPagePaddingClass,
} from "@/components/layout/learner-page";
import type { LearnerDashboardView } from "@/lib/dashboard/learner-dashboard-page";
import type { DashboardCourseItem, DashboardData } from "@/lib/dashboard/queries";
import type { Certificate, Course, Product } from "@/types/database";

export interface LearnerDashboardProps {
  view?: LearnerDashboardView;
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
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md focus-ring"
    >
      <div className="relative">
        <ProductVisual
          name={productName}
          category={course.product?.category}
          imageUrl={course.thumbnail_url ?? course.product?.cover_image_url}
          variant="card"
          className="aspect-[16/10] rounded-none border-0"
        />
        <div className="absolute left-2.5 top-2.5 z-10 max-w-[calc(100%-3.5rem)]">
          <Badge
            variant={
              status === "completed"
                ? "success"
                : status === "in-progress"
                  ? "default"
                  : "secondary"
            }
            className="text-[10px] sm:text-xs"
          >
            {status === "completed"
              ? "Completed"
              : status === "in-progress"
                ? "In progress"
                : "Not started"}
          </Badge>
        </div>
        <div className="absolute bottom-2 right-2 z-10 rounded-full bg-card/95 p-0.5 shadow-sm">
          <ProgressRing
            value={progress}
            size={40}
            strokeWidth={3.5}
            textClassName="text-[9px]"
            label={`${course.title} progress`}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <p className="text-[11px] font-medium text-muted-foreground">{productName}</p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-accent sm:text-[15px]">
          {course.title}
        </h3>
        {course.short_description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {course.short_description}
          </p>
        )}
        <div className="mt-auto pt-3">
          <ProgressBar value={progress} size="sm" showValue />
        </div>
      </div>
    </Link>
  );
}

function CertificatesPanel({
  data,
  latestCertificate,
  latestCertificateCourse,
  formatIssuedOn,
  showRecentCompletions = false,
  className,
}: {
  data: DashboardData;
  latestCertificate?: Certificate;
  latestCertificateCourse?: Course | null;
  formatIssuedOn: (value: string) => string;
  showRecentCompletions?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`h-fit rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy text-navy-foreground">
            <Award className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
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

        <Link href="/certificates" className="shrink-0">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            {data.certificateCount > 0 ? "View certificates" : "How certificates work"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>

      {showRecentCompletions && data.recentlyCompleted.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">
            Recently completed
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.recentlyCompleted.map((item) => (
              <li key={item.course.id}>
                <Link
                  href={`/courses/${item.course.slug}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface/70 px-3 py-2 transition-colors hover:bg-surface focus-ring"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <CheckCircle2
                      className="size-3.5 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    <span className="truncate text-sm font-medium text-foreground">
                      {item.course.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-success">Done</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function LearningSnapshotCard({
  inProgressCount,
  enrolledCount,
  completedCount,
}: {
  inProgressCount: number;
  enrolledCount: number;
  completedCount: number;
}) {
  return (
    <section
      className="rounded-xl border border-border bg-card p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6"
      aria-label="Learning snapshot"
    >
      <div>
        <h2 className="text-base font-semibold text-foreground">Your learning snapshot</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {enrolledCount === 0
            ? "You have not enrolled in a course yet. Browse the catalog to get started."
            : `${inProgressCount} in progress · ${completedCount} completed · ${enrolledCount} enrolled`}
        </p>
      </div>
      <Link href="/my-learning" className="mt-4 block shrink-0 sm:mt-0">
        <Button variant="outline" size="md" className="w-full sm:w-auto">
          Open My Learning
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </Link>
    </section>
  );
}

function ResumeLessonStrip({
  title,
  courseTitle,
  href,
  kind,
}: {
  title: string;
  courseTitle: string;
  href: string;
  kind: "lesson" | "quiz";
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Resume
        </p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{courseTitle}</p>
        <p className="truncate font-medium text-foreground">{title}</p>
      </div>
      <Link href={href} className="shrink-0">
        <Button size="sm" className="w-full sm:w-auto">
          {kind === "quiz" ? "Take quiz" : "Resume lesson"}
        </Button>
      </Link>
    </div>
  );
}

function sortCoursesForLearning(items: DashboardCourseItem[]): DashboardCourseItem[] {
  const order = { "in-progress": 0, "not-started": 1, completed: 2 };
  return [...items].sort(
    (a, b) => order[a.status] - order[b.status] || b.progress - a.progress,
  );
}

function MyCoursesSection({ data }: { data: DashboardData }) {
  const sorted = sortCoursesForLearning(data.myCourses);
  return (
    <section id="my-courses" className="scroll-mt-24">
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
      {sorted.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>*]:min-w-0">
          {sorted.map((item) => (
            <EnrolledCourseTile key={item.course.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
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
  );
}

export function LearnerDashboard({
  view = "home",
  greeting,
  greetingName,
  data,
  startChoices,
  exploreProducts,
  continueCourse,
}: LearnerDashboardProps) {
  const isLearningView = view === "learning";
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

  const homeStats = [
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

  const learningStats = [
    {
      label: "Enrolled",
      value: String(data.myCourses.length),
      icon: BookOpen,
    },
    {
      label: "In progress",
      value: String(inProgressCount),
      icon: Sparkles,
    },
    {
      label: "Completed",
      value: String(completedCount),
      icon: CheckCircle2,
    },
    {
      label: "Avg. progress",
      value: `${overallProgress}%`,
      icon: Award,
    },
  ];

  const stats = isLearningView ? learningStats : homeStats;

  return (
    <LearnerPage>
      <section className="relative w-full overflow-hidden border-b border-navy/20 bg-navy text-navy-foreground">
        <div
          className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-accent/35 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 right-20 size-64 rounded-full bg-accent-hover/25 blur-3xl"
          aria-hidden="true"
        />

        <div
          className={`relative py-6 sm:py-7 ${learnerPageMaxClass} ${learnerPagePaddingClass}`}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                {isLearningView ? "My learning" : "Your learning home"}
              </p>
              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
                {isLearningView
                  ? "Your courses & progress"
                  : `${greeting}, ${greetingName}`}
              </h1>
              <p className="mt-2 text-sm text-white/75 sm:text-[15px]">
                {isLearningView
                  ? `Hi ${greetingName} — track enrollments, pick up lessons, and review what you have finished.`
                  : data.nextLesson
                    ? "Your overview for today: resume training, discover solutions, and see what we recommend next."
                    : "Discover Maxpro training, enroll in courses, and build skills across your solutions."}
              </p>
              <LearnerDashboardTabs activeView={view} />
            </div>

            <dl className="grid w-full min-w-0 grid-cols-2 gap-2 sm:max-w-xl sm:grid-cols-4 lg:max-w-none lg:w-auto lg:shrink-0">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-sm"
                >
                  <dt className="flex min-w-0 items-center gap-1 text-[10px] font-medium uppercase leading-tight text-white/65 sm:text-[11px]">
                    <stat.icon className="size-3 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 truncate">{stat.label}</span>
                  </dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight sm:text-xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div
        className={`flex flex-1 flex-col py-5 sm:py-6 lg:py-8 ${learnerPageMaxClass} ${learnerPagePaddingClass}`}
      >
        {isLearningView ? (
          <>
            {data.nextLesson ? (
              <section className="mb-8 lg:mb-9">
                <ResumeLessonStrip
                  title={data.nextLesson.title}
                  courseTitle={data.nextLesson.courseTitle}
                  href={data.nextLesson.href}
                  kind={data.nextLesson.kind}
                />
              </section>
            ) : null}

            <MyCoursesSection data={data} />

            <div className="mt-8 lg:mt-9">
              <CertificatesPanel
                data={data}
                latestCertificate={latestCertificate}
                latestCertificateCourse={latestCertificateCourse}
                formatIssuedOn={formatIssuedOn}
                showRecentCompletions
              />
            </div>
          </>
        ) : (
          <>
            <section>
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

            <div className="mt-8 lg:mt-9">
              <LearningSnapshotCard
                inProgressCount={inProgressCount}
                enrolledCount={data.myCourses.length}
                completedCount={completedCount}
              />
            </div>

            <div className="mt-8 grid gap-6 lg:mt-9 lg:grid-cols-2 lg:items-start">
              {exploreProducts.length > 0 && (
                <section aria-label="Explore solutions" className="min-w-0">
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
                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                    {exploreProducts.slice(0, 6).map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="group flex min-w-0 items-center gap-2.5 overflow-hidden rounded-lg border border-border bg-card p-2 shadow-sm transition-shadow hover:shadow-md focus-ring"
                      >
                        <ProductVisual
                          name={product.name}
                          category={product.category}
                          imageUrl={product.cover_image_url}
                          variant="thumb"
                          className="size-11 shrink-0 rounded-md border-0"
                        />
                        <div className="min-w-0 py-0.5">
                          <p className="truncate text-xs font-semibold leading-tight text-foreground group-hover:text-accent">
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

              <CertificatesPanel
                data={data}
                latestCertificate={latestCertificate}
                latestCertificateCourse={latestCertificateCourse}
                formatIssuedOn={formatIssuedOn}
                className={exploreProducts.length === 0 ? "lg:col-span-2" : ""}
              />
            </div>

            {data.recommendedCourses.length > 0 && (
              <section className="mt-8 pb-2 lg:mt-9">
                <SectionHeading
                  title="Recommended for you"
                  description="Based on your preferred solutions and learning role."
                />
                <div className="mt-4 grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                      className="shadow-sm hover:shadow-md [&_h3]:text-sm"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </LearnerPage>
  );
}

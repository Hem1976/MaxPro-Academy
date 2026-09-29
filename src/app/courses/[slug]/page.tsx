import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, CheckCircle2, Clock } from "lucide-react";
import { CourseThumbnail } from "@/components/brand/course-thumbnail";
import { AppShell } from "@/components/layout/app-shell";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ModuleAccordion } from "@/components/course/module-accordion";
import { FadeIn } from "@/components/marketing/fade-in";
import { getCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";
import {
  getCourseProgress,
  getCourseQuizWithQuestions,
  getDemoLessonProgress,
  hasPassedCourseQuiz,
} from "@/lib/data/demo-store";
import {
  getAllCourseSlugs,
  getCourseBySlugDetailed,
} from "@/lib/data/queries";
import { formatMinutes } from "@/lib/utils";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

/** CMS content changes at runtime (AI drafts) — never cache a 404. */
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllCourseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlugDetailed(slug);

  if (!course) {
    return { title: "Course not found" };
  }

  return {
    title: course.title,
    description:
      course.short_description ??
      `Learn ${course.title} on Maxpro Academy.`,
  };
}

function getFirstLessonHref(
  courseSlug: string,
  course: ReturnType<typeof getCourseBySlugDetailed>,
) {
  if (!course) return `/courses/${courseSlug}`;

  for (const module of course.modules) {
    const firstLesson = module.lessons[0];
    if (firstLesson) {
      return `/courses/${courseSlug}/lesson/${firstLesson.slug}`;
    }
  }

  return `/courses/${courseSlug}`;
}

function getContinueHref(
  courseSlug: string,
  course: NonNullable<ReturnType<typeof getCourseBySlugDetailed>>,
  userId: string,
): string {
  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      const progress = getDemoLessonProgress(userId, lesson.id);
      if (!progress?.completed) {
        return `/courses/${courseSlug}/lesson/${lesson.slug}`;
      }
    }
  }

  if (
    getCourseQuizWithQuestions(course.id) &&
    !hasPassedCourseQuiz(userId, course.id)
  ) {
    return `/courses/${courseSlug}/quiz`;
  }

  return `/courses/${courseSlug}/complete`;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseBySlugDetailed(slug);
  const user = await getCurrentUser();

  if (!course || !course.published) {
    notFound();
  }

  const totalLessons = course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0,
  );

  const startHref = getFirstLessonHref(slug, course);

  const courseProgress = user
    ? getCourseProgress(user.id, course.id)
    : null;
  const enrolled = courseProgress?.enrolled ?? false;
  const progressPercent = courseProgress?.percent ?? 0;
  const isCompleted = progressPercent >= 100;

  const actionHref =
    user && enrolled
      ? isCompleted
        ? `/courses/${slug}/complete`
        : progressPercent > 0
          ? getContinueHref(slug, course, user.id)
          : startHref
      : startHref;

  const actionLabel =
    user && enrolled
      ? isCompleted
        ? "View completion"
        : progressPercent > 0
          ? "Continue learning"
          : "Start course"
      : "Start course";

  const accordionModules = course.modules.map((module) => ({
    id: module.id,
    title: module.title,
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      href: `/courses/${slug}/lesson/${lesson.slug}`,
      durationMinutes: Math.ceil(lesson.duration_seconds / 60),
      completed: user
        ? getDemoLessonProgress(user.id, lesson.id)?.completed === true
        : false,
    })),
  }));

  const courseQuiz = getCourseQuizWithQuestions(course.id);
  const quizPassed = user ? hasPassedCourseQuiz(user.id, course.id) : false;

  const page = (
    <Container className="py-8 lg:py-12">
      <Breadcrumb
        items={[
          { label: "Courses", href: "/courses" },
          ...(course.product
            ? [
                {
                  label: course.product.name,
                  href: `/products/${course.product.slug}`,
                },
              ]
            : []),
          { label: course.title },
        ]}
        className="mb-6"
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-10">
        <div>
          <FadeIn>
            <header>
              {course.product && (
                <div className="mb-6 max-w-xl">
                  <CourseThumbnail
                    productName={course.product.name}
                    courseTitle={course.title}
                    productCategory={course.product.category}
                    imageUrl={
                      course.thumbnail_url ?? course.product.cover_image_url
                    }
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {course.level}
                </Badge>
                {course.certificate_enabled && (
                  <Badge variant="secondary">
                    <Award className="mr-1 size-3" aria-hidden="true" />
                    Certificate
                  </Badge>
                )}
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy dark:text-foreground sm:text-4xl">
                {course.title}
              </h1>
              {course.short_description && (
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                  {course.short_description}
                </p>
              )}
              {course.description && (
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {course.description}
                </p>
              )}
            </header>
          </FadeIn>

          {course.learning_outcomes && course.learning_outcomes.length > 0 && (
            <section className="mt-10">
              <FadeIn>
                <h2 className="text-xl font-semibold tracking-tight text-navy dark:text-foreground">
                  What you&apos;ll learn
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {course.learning_outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-3 text-muted-foreground">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-success"
                        aria-hidden="true"
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </section>
          )}

          <section className="mt-10">
            <FadeIn>
              <h2 className="text-xl font-semibold tracking-tight text-navy dark:text-foreground">
                Course content
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {course.modules.length > 1
                  ? `${course.modules.length} modules · ${totalLessons} lessons`
                  : `${totalLessons} lessons`}
                {courseQuiz ? " · 1 quiz" : ""}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <ModuleAccordion
                modules={accordionModules}
                className="mt-4"
              />
              {courseQuiz && (
                <Link
                  href={`/courses/${slug}/quiz`}
                  className="mt-3 flex items-center gap-3 rounded-lg border border-border px-4 py-3.5 text-sm transition-colors hover:bg-surface/60 focus-ring"
                >
                  {quizPassed ? (
                    <CheckCircle2
                      className="size-4 shrink-0 text-success"
                      aria-label="Completed"
                    />
                  ) : (
                    <Award
                      className="size-4 shrink-0 text-navy"
                      aria-hidden="true"
                    />
                  )}
                  <span>
                    <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Quiz
                    </span>
                    <span className="font-semibold text-foreground">
                      {courseQuiz.title}
                    </span>
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {courseQuiz.questions.length} questions
                  </span>
                </Link>
              )}
            </FadeIn>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <FadeIn>
            <div className="rounded-lg border border-border bg-surface p-5">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="size-3.5 text-muted" aria-hidden="true" />
                    {formatMinutes(course.estimated_minutes)}
                  </dd>
                </div>
                {course.modules.length > 1 && (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Modules</dt>
                    <dd className="font-medium text-foreground">
                      {course.modules.length}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Lessons</dt>
                  <dd className="font-medium text-foreground">{totalLessons}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Level</dt>
                  <dd className="font-medium capitalize text-foreground">
                    {course.level}
                  </dd>
                </div>
              </dl>

              {user && enrolled && (
                <div className="mt-4 border-t border-border pt-4">
                  <ProgressBar
                    value={progressPercent}
                    showValue
                    size="sm"
                    label="Your progress"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {courseProgress?.completedRequired ?? 0} of{" "}
                    {courseProgress?.totalRequired ?? 0} required items
                    complete
                  </p>
                </div>
              )}

              {course.certificate_enabled && (
                <div className="mt-4 flex items-start gap-2.5 rounded-md border border-border/60 bg-card/50 px-3 py-2.5">
                  <Award
                    className="mt-0.5 size-4 shrink-0 text-navy"
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Earn a certificate by completing all required lessons and
                    the knowledge check.
                  </p>
                </div>
              )}

              <div className="mt-5 space-y-2">
                <Link href={actionHref} className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    {actionLabel}
                  </Button>
                </Link>
                {!user && (
                  <Link href="/login" className="block">
                    <Button variant="outline" size="lg" className="w-full">
                      Sign in to track progress
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </FadeIn>
        </aside>
      </div>
    </Container>
  );

  if (user && !canAccessAdmin(user.profile.role)) {
    return <AppShell>{page}</AppShell>;
  }

  return <MarketingShell>{page}</MarketingShell>;
}

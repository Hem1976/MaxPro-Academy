"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Target,
} from "lucide-react";
import {
  completeCourseIfEligible,
  updateLessonProgress,
} from "@/actions/progress";
import { CourseSidebar, type SidebarModule, type SidebarQuiz } from "@/components/lesson/course-sidebar";
import { LessonContent } from "@/components/lesson/lesson-content";
import { VideoPlayer } from "@/components/lesson/video-player";
import { learnerShellClassName } from "@/components/layout/learner-page";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { LessonProgress, LessonResource } from "@/types/database";

export interface LessonWorkspaceProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  lesson: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    learning_objective: string | null;
    video_url: string | null;
    video_provider?: string | null;
    captions_url: string | null;
    duration_seconds: number;
    written_content: string | null;
    resources?: LessonResource[];
  };
  progress: LessonProgress | null;
  sidebarModules: SidebarModule[];
  sidebarQuiz?: SidebarQuiz | null;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  nextLesson: { slug: string; title: string } | null;
  previousLesson: { slug: string; title: string } | null;
}

export function LessonWorkspace({
  courseId,
  courseSlug,
  courseTitle,
  lesson,
  progress,
  sidebarModules,
  sidebarQuiz,
  completedCount,
  totalCount,
  progressPercent,
  nextLesson,
  previousLesson,
}: LessonWorkspaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(progress?.completed ?? false);
  const [isPending, startTransition] = useTransition();

  const handleMarkComplete = () => {
    startTransition(async () => {
      const result = await updateLessonProgress({
        lessonId: lesson.id,
        lastPosition: lesson.duration_seconds,
        watchedSeconds: lesson.duration_seconds,
        markComplete: true,
      });

      if (!result.success) {
        toast({
          title: "Could not mark lesson complete",
          description: result.error,
          variant: "error",
        });
        return;
      }

      setIsCompleted(true);
      toast({
        title: "Lesson complete",
        description: "Nice work — your progress has been saved.",
        variant: "success",
      });

      const courseResult = await completeCourseIfEligible(courseId);

      if (courseResult.success && courseResult.data.completed) {
        router.push(`/courses/${courseSlug}/complete`);
        return;
      }

      router.refresh();
    });
  };

  const nextHref = nextLesson
    ? `/courses/${courseSlug}/lesson/${nextLesson.slug}`
    : sidebarQuiz
      ? `/courses/${courseSlug}/quiz`
      : `/courses/${courseSlug}/complete`;
  const nextLabel = nextLesson
    ? nextLesson.title
    : sidebarQuiz
      ? sidebarQuiz.title
      : "Finish course";
  const nextButtonLabel = nextLesson
    ? "Next lesson"
    : sidebarQuiz
      ? "Go to quiz"
      : "Finish course";

  return (
    <div className={learnerShellClassName("py-6 lg:py-8")}>
      <div className="mb-6">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to course
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-[7] space-y-6">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight text-navy dark:text-foreground sm:text-3xl">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="mt-2 text-muted-foreground">{lesson.description}</p>
            )}
          </header>

          <div className="mx-auto w-full max-w-[960px]">
            <VideoPlayer
              lessonId={lesson.id}
              videoUrl={lesson.video_url}
              videoProvider={lesson.video_provider}
              captionsUrl={lesson.captions_url}
              durationSeconds={lesson.duration_seconds}
              lastPosition={progress?.last_position ?? 0}
              completed={isCompleted}
              lessonTitle={lesson.title}
              courseTitle={courseTitle}
            />
          </div>

          {lesson.learning_objective && (
            <div className="mx-auto w-full max-w-[960px] rounded-md border-l-2 border-accent bg-accent-muted/40 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <Target
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Learning objective
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-foreground">
                    {lesson.learning_objective}
                  </p>
                </div>
              </div>
            </div>
          )}

          {lesson.written_content && (
            <section aria-labelledby="lesson-content-heading">
              <h2
                id="lesson-content-heading"
                className="mb-4 text-lg font-semibold text-navy"
              >
                Lesson guide
              </h2>
              <LessonContent content={lesson.written_content} />
            </section>
          )}

          {lesson.resources && lesson.resources.length > 0 && (
            <section aria-labelledby="lesson-resources-heading">
              <h2
                id="lesson-resources-heading"
                className="mb-4 text-lg font-semibold text-navy"
              >
                Resources
              </h2>
              <ul className="space-y-3">
                {lesson.resources.map((resource) => (
                  <li key={resource.id}>
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-surface focus-ring"
                    >
                      <ExternalLink
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {resource.title}
                        </p>
                        {resource.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            {!isCompleted ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleMarkComplete}
                disabled={isPending}
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {isPending ? "Saving…" : "Mark as complete"}
              </Button>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Lesson completed
              </span>
            )}
          </div>

          <nav
            className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
            aria-label="Lesson navigation"
          >
            {previousLesson ? (
              <Link
                href={`/courses/${courseSlug}/lesson/${previousLesson.slug}`}
                className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-ring"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span className="truncate">
                  Previous: {previousLesson.title}
                </span>
              </Link>
            ) : (
              <span />
            )}

            <Link href={nextHref} className="sm:ml-auto">
              <Button type="button" size="lg" disabled={isPending}>
                {nextButtonLabel}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
          </nav>

          {(nextLesson || sidebarQuiz) && (
            <div className="rounded-lg border border-border bg-surface px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Up next
              </p>
              <p className="mt-1 font-semibold text-foreground">{nextLabel}</p>
              <Link href={nextHref} className="mt-3 inline-block">
                <Button variant="outline" size="sm">
                  {nextLesson ? "Continue to next lesson" : "Continue to quiz"}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          )}

          <div className="rounded-lg border border-border bg-surface/60 p-4">
            <div className="flex items-start gap-3">
              <HelpCircle
                className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Still need help?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contact Maxpro Support for assistance with this lesson or your
                  deployment.
                </p>
                <a
                  href="mailto:helpdesk@maxproinfotech.com"
                  className="mt-2 inline-block rounded-sm text-sm font-medium text-accent hover:underline focus-ring"
                >
                  helpdesk@maxproinfotech.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="order-first min-w-0 flex-[3] lg:order-none">
          <CourseSidebar
            courseTitle={courseTitle}
            courseSlug={courseSlug}
            modules={sidebarModules}
            completedCount={completedCount}
            totalCount={totalCount}
            progressPercent={progressPercent}
            quiz={sidebarQuiz}
          />
        </div>
      </div>
    </div>
  );
}

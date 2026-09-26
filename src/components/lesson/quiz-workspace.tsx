"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { completeCourseIfEligible } from "@/actions/progress";
import {
  CourseSidebar,
  type SidebarModule,
  type SidebarQuiz,
} from "@/components/lesson/course-sidebar";
import { QuizPanel, type QuizPanelQuestion } from "@/components/lesson/quiz-panel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export interface QuizWorkspaceProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  quiz: {
    id: string;
    title: string;
    description: string | null;
    passing_score: number;
    questions: QuizPanelQuestion[];
  };
  alreadyPassed: boolean;
  lastLesson: { slug: string; title: string } | null;
  sidebarModules: SidebarModule[];
  sidebarQuiz: SidebarQuiz;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

export function QuizWorkspace({
  courseId,
  courseSlug,
  courseTitle,
  quiz,
  alreadyPassed,
  lastLesson,
  sidebarModules,
  sidebarQuiz,
  completedCount,
  totalCount,
  progressPercent,
}: QuizWorkspaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [passed, setPassed] = useState(alreadyPassed);
  const [isPending, startTransition] = useTransition();

  const handlePassed = () => {
    setPassed(true);
    startTransition(async () => {
      const result = await completeCourseIfEligible(courseId);
      if (result.success && result.data.completed) {
        toast({
          title: "Quiz passed",
          description: "You completed the course knowledge check.",
          variant: "success",
        });
        router.refresh();
      }
    });
  };

  return (
    <div className="container-max py-6 lg:py-8">
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
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Course quiz
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
              {quiz.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {quiz.description ??
                "Answer these questions to confirm you understood the full course."}
            </p>
          </header>

          {passed && (
            <div className="rounded-md border border-success/40 bg-success/5 px-4 py-3 text-sm text-foreground">
              <span className="inline-flex items-center gap-2 font-medium text-success">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Knowledge check passed
              </span>
            </div>
          )}

          <QuizPanel
            quizId={quiz.id}
            title={quiz.title}
            description={quiz.description}
            passingScore={quiz.passing_score}
            questions={quiz.questions}
            onPassed={handlePassed}
          />

          <nav
            className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
            aria-label="Quiz navigation"
          >
            {lastLesson ? (
              <Link
                href={`/courses/${courseSlug}/lesson/${lastLesson.slug}`}
                className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-ring"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span className="truncate">Previous: {lastLesson.title}</span>
              </Link>
            ) : (
              <span />
            )}

            <Link
              href={
                passed
                  ? `/courses/${courseSlug}/complete`
                  : `/courses/${courseSlug}`
              }
              className="sm:ml-auto"
            >
              <Button type="button" size="lg" disabled={isPending}>
                {passed ? "Finish course" : "Back to course"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
          </nav>
        </div>

        <div className="min-w-0 flex-[3]">
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

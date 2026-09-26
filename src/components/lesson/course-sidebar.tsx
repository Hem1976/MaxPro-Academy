"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, HelpCircle, List, PlayCircle } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SidebarLesson {
  id: string;
  title: string;
  slug: string;
  completed: boolean;
  current: boolean;
}

export interface SidebarModule {
  id: string;
  title: string;
  lessons: SidebarLesson[];
}

export interface SidebarQuiz {
  title: string;
  completed: boolean;
  current: boolean;
}

export interface CourseSidebarProps {
  courseTitle: string;
  courseSlug: string;
  modules: SidebarModule[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  quiz?: SidebarQuiz | null;
  className?: string;
}

function SidebarContent({
  courseTitle,
  courseSlug,
  modules,
  completedCount,
  totalCount,
  progressPercent,
  quiz,
}: Omit<CourseSidebarProps, "className">) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border/60 px-4 py-4">
        <h2 className="text-sm font-semibold leading-snug text-navy">
          {courseTitle}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {completedCount} of {totalCount} items complete
        </p>
        <ProgressBar
          value={progressPercent}
          showValue
          size="sm"
          className="mt-2.5"
          label="Course progress"
        />
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-2 py-3"
        aria-label="Course lessons"
      >
        {modules.map((module, moduleIndex) => (
          <div key={module.id} className="mb-3 last:mb-0">
            {modules.length > 1 && (
              <>
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Module {String(moduleIndex + 1).padStart(2, "0")}
                </p>
                <h3 className="px-2 text-xs font-medium text-foreground">
                  {module.title}
                </h3>
              </>
            )}
            <ul className={cn("space-y-0.5", modules.length > 1 ? "mt-1" : "")}>
              {module.lessons.map((lesson, lessonIndex) => {
                const href = `/courses/${courseSlug}/lesson/${lesson.slug}`;
                const showLessonNumber = modules.length === 1;

                return (
                  <li key={lesson.id}>
                    <Link
                      href={href}
                      aria-current={lesson.current ? "page" : undefined}
                      className={cn(
                        "flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors focus-ring",
                        lesson.current
                          ? "bg-accent-muted/70 font-medium text-accent"
                          : "text-foreground hover:bg-surface/80",
                      )}
                    >
                      {showLessonNumber && (
                        <span
                          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-surface text-[10px] font-semibold tabular-nums text-muted-foreground"
                          aria-hidden="true"
                        >
                          {lessonIndex + 1}
                        </span>
                      )}
                      {lesson.completed ? (
                        <CheckCircle2
                          className="mt-0.5 size-3.5 shrink-0 text-success"
                          aria-label="Completed"
                        />
                      ) : lesson.current ? (
                        <PlayCircle
                          className="mt-0.5 size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Circle
                          className="mt-0.5 size-3.5 shrink-0 text-muted"
                          aria-hidden="true"
                        />
                      )}
                      <span className="leading-snug">{lesson.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {quiz && (
        <div className="shrink-0 border-t border-border/60 bg-surface/80 px-2 py-3">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Quiz
          </p>
          <h3 className="px-2 text-xs font-medium text-foreground">
            Course quiz
          </h3>
          <ul className="mt-1 space-y-0.5">
            <li>
              <Link
                href={`/courses/${courseSlug}/quiz`}
                aria-current={quiz.current ? "page" : undefined}
                className={cn(
                  "flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors focus-ring",
                  quiz.current
                    ? "bg-accent-muted/70 font-medium text-accent"
                    : "text-foreground hover:bg-surface/80",
                )}
              >
                {quiz.completed ? (
                  <CheckCircle2
                    className="mt-0.5 size-3.5 shrink-0 text-success"
                    aria-label="Completed"
                  />
                ) : (
                  <HelpCircle
                    className="mt-0.5 size-3.5 shrink-0 text-muted"
                    aria-hidden="true"
                  />
                )}
                <span className="leading-snug">{quiz.title}</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export function CourseSidebar({
  courseTitle,
  courseSlug,
  modules,
  completedCount,
  totalCount,
  progressPercent,
  quiz,
  className,
}: CourseSidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="mb-4 lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="course-sidebar-drawer"
        >
          <List className="size-4" aria-hidden="true" />
          Course outline
        </Button>
      </div>

      <aside
        className={cn(
          "hidden shrink-0 lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-7rem)] lg:max-h-[calc(100vh-7rem)] lg:w-full lg:flex-col lg:self-start lg:overflow-hidden lg:rounded-lg lg:border lg:border-border/60 lg:bg-surface/30",
          className,
        )}
        aria-label="Course navigation"
      >
        <SidebarContent
          courseTitle={courseTitle}
          courseSlug={courseSlug}
          modules={modules}
          completedCount={completedCount}
          totalCount={totalCount}
          progressPercent={progressPercent}
          quiz={quiz}
        />
      </aside>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Course outline"
        side="right"
        className="w-80 max-w-[90vw]"
      >
        <div id="course-sidebar-drawer">
          <SidebarContent
            courseTitle={courseTitle}
            courseSlug={courseSlug}
            modules={modules}
            completedCount={completedCount}
            totalCount={totalCount}
            progressPercent={progressPercent}
            quiz={quiz}
          />
        </div>
      </Drawer>
    </>
  );
}

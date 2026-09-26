"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle, Circle, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LessonItem {
  id: string;
  title: string;
  href: string;
  durationMinutes?: number;
  completed?: boolean;
  active?: boolean;
}

export interface ModuleItem {
  id: string;
  title: string;
  lessons: LessonItem[];
}

export interface ModuleAccordionProps {
  modules: ModuleItem[];
  defaultOpenId?: string;
  className?: string;
}

export function ModuleAccordion({
  modules,
  defaultOpenId,
  className,
}: ModuleAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(
    defaultOpenId ?? modules[0]?.id ?? null,
  );

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  if (modules.length === 1) {
    const lessons = modules[0]?.lessons ?? [];
    return (
      <ul
        className={cn(
          "divide-y divide-border rounded-lg border border-border",
          className,
        )}
      >
        {lessons.map((lesson, lessonIndex) => (
          <li key={lesson.id}>
            <Link
              href={lesson.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 text-sm transition-colors focus-ring",
                lesson.active
                  ? "bg-accent-muted text-accent"
                  : "text-foreground hover:bg-surface/60",
              )}
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface text-xs font-semibold tabular-nums text-muted-foreground"
                aria-hidden="true"
              >
                {lessonIndex + 1}
              </span>
              {lesson.completed ? (
                <CheckCircle
                  className="size-4 shrink-0 text-success"
                  aria-label="Completed"
                />
              ) : lesson.active ? (
                <PlayCircle
                  className="size-4 shrink-0 text-accent"
                  aria-label="Current lesson"
                />
              ) : (
                <Circle
                  className="size-4 shrink-0 text-muted"
                  aria-label="Not started"
                />
              )}
              <span className="flex-1 font-medium">{lesson.title}</span>
              {lesson.durationMinutes !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {lesson.durationMinutes}m
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className={cn(
        "divide-y divide-border rounded-lg border border-border",
        className,
      )}
    >
      {modules.map((module, moduleIndex) => {
        const isOpen = openId === module.id;
        const completedCount = module.lessons.filter((l) => l.completed).length;
        const moduleNumber = String(moduleIndex + 1).padStart(2, "0");

        return (
          <div key={module.id}>
            <button
              type="button"
              onClick={() => toggle(module.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-surface/60 focus-ring"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Module {moduleNumber}
                </p>
                <h3 className="mt-0.5 font-semibold text-foreground">
                  {module.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {completedCount}/{module.lessons.length} lessons
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <ul className="border-t border-border px-2 py-2">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          href={lesson.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-ring",
                            lesson.active
                              ? "bg-accent-muted text-accent"
                              : "text-foreground hover:bg-surface",
                          )}
                        >
                          {lesson.completed ? (
                            <CheckCircle
                              className="size-4 shrink-0 text-success"
                              aria-label="Completed"
                            />
                          ) : lesson.active ? (
                            <PlayCircle
                              className="size-4 shrink-0 text-accent"
                              aria-label="Current lesson"
                            />
                          ) : (
                            <Circle
                              className="size-4 shrink-0 text-muted"
                              aria-label="Not started"
                            />
                          )}
                          <span className="flex-1">{lesson.title}</span>
                          {lesson.durationMinutes !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              {lesson.durationMinutes}m
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

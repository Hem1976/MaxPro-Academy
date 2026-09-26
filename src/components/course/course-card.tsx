import Link from "next/link";
import { Award, BookOpen, Clock } from "lucide-react";
import { CourseThumbnail } from "@/components/brand/course-thumbnail";
import { cn, formatMinutes } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { CourseLevel } from "@/types/database";

export interface CourseCardProps {
  productName: string;
  title: string;
  description?: string;
  href: string;
  thumbnailUrl?: string | null;
  productCategory?: string | null;
  level?: CourseLevel;
  lessonCount?: number;
  durationMinutes?: number;
  certificateEnabled?: boolean;
  progress?: number;
  status?: "not-started" | "in-progress" | "completed";
  className?: string;
}

const levelLabels: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function CourseCard({
  productName,
  title,
  description,
  href,
  thumbnailUrl,
  productCategory,
  level,
  lessonCount,
  durationMinutes,
  certificateEnabled,
  progress,
  status = "not-started",
  className,
}: CourseCardProps) {
  const showProgress = progress !== undefined && progress > 0;

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-border-strong",
        className,
      )}
    >
      <CourseThumbnail
        productName={productName}
        courseTitle={title}
        productCategory={productCategory}
        imageUrl={thumbnailUrl}
        className="rounded-none"
      />

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-muted">{productName}</p>
        <h3 className="mt-1 font-semibold text-foreground group-hover:text-accent">
          {title}
        </h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {level && <span>{levelLabels[level]}</span>}
          {durationMinutes !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {formatMinutes(durationMinutes)}
            </span>
          )}
          {lessonCount !== undefined && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3.5" aria-hidden="true" />
              {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
            </span>
          )}
          {certificateEnabled && (
            <span className="inline-flex items-center gap-1 text-muted">
              <Award className="size-3.5" aria-hidden="true" />
              Certificate
            </span>
          )}
        </div>

        {status !== "not-started" && !showProgress && (
          <p className="mt-2 text-xs text-muted-foreground">
            {status === "completed" ? "Completed" : "In progress"}
          </p>
        )}

        {showProgress && (
          <div className="mt-3">
            <ProgressBar value={progress} size="sm" showValue />
          </div>
        )}
      </div>
    </Link>
  );
}

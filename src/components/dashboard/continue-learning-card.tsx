import Link from "next/link";
import { HelpCircle, Play } from "lucide-react";
import { ProductVisual } from "@/components/brand/product-visual";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/utils";

export interface ContinueLearningCardProps {
  title: string;
  courseTitle: string;
  moduleTitle: string;
  href: string;
  progressPercent: number;
  kind: "lesson" | "quiz";
  productName?: string;
  productCategory?: string | null;
  imageUrl?: string | null;
  remainingMinutes?: number | null;
}

export function ContinueLearningCard({
  title,
  courseTitle,
  moduleTitle,
  href,
  progressPercent,
  kind,
  productName,
  productCategory,
  imageUrl,
  remainingMinutes,
}: ContinueLearningCardProps) {
  const isQuiz = kind === "quiz";

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Link
          href={href}
          className="group relative block min-h-[220px] overflow-hidden bg-navy focus-ring"
          aria-label={isQuiz ? `Take quiz: ${title}` : `Resume lesson: ${title}`}
        >
          {productName ? (
            <ProductVisual
              name={productName}
              category={productCategory}
              imageUrl={imageUrl}
              variant="hero"
              className="absolute inset-0 size-full rounded-none border-0 aspect-auto h-full"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-navy to-accent" />
          )}
          <div className="absolute inset-0 bg-linear-to-tr from-navy/70 via-navy/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-white text-navy shadow-lg transition-transform duration-200 group-hover:scale-105">
              {isQuiz ? (
                <HelpCircle className="size-7" aria-hidden="true" />
              ) : (
                <Play className="size-7 fill-navy" aria-hidden="true" />
              )}
            </span>
          </div>
          <p className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            Continue learning
          </p>
        </Link>

        <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Up next
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {courseTitle}
              <span className="mx-1.5 text-border-strong">·</span>
              {moduleTitle}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-navy dark:text-foreground">
              {title}
            </h2>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <ProgressRing
                value={progressPercent}
                size={68}
                strokeWidth={6}
                label="Course progress"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Course progress</p>
                {remainingMinutes != null && remainingMinutes > 0 ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    About {formatMinutes(remainingMinutes)} left
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Pick up where you left off
                  </p>
                )}
              </div>
            </div>

            <Link href={href} className="shrink-0">
              <Button size="lg">
                {isQuiz ? (
                  <HelpCircle className="size-4" aria-hidden="true" />
                ) : (
                  <Play className="size-4 fill-current" aria-hidden="true" />
                )}
                {isQuiz ? "Take quiz" : "Resume lesson"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

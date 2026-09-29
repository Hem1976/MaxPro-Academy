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
      <div className="grid items-stretch md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Link
          href={href}
          className="group relative block min-h-[9.5rem] overflow-hidden bg-navy focus-ring sm:min-h-[10.5rem] md:min-h-[11rem]"
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
            <span className="flex size-12 items-center justify-center rounded-full bg-white text-navy shadow-md transition-transform duration-200 group-hover:scale-105 sm:size-14">
              {isQuiz ? (
                <HelpCircle className="size-6" aria-hidden="true" />
              ) : (
                <Play className="size-6 fill-navy" aria-hidden="true" />
              )}
            </span>
          </div>
          <p className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-[11px]">
            Continue learning
          </p>
        </Link>

        <div className="flex flex-col justify-between gap-4 p-4 sm:p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              Up next
            </p>
            <p className="mt-1.5 flex flex-col gap-0.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:text-sm">
              <span className="truncate">{courseTitle}</span>
              <span className="hidden text-border-strong sm:inline" aria-hidden="true">
                ·
              </span>
              <span className="truncate">{moduleTitle}</span>
            </p>
            <h2 className="mt-1 line-clamp-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <ProgressRing
                value={progressPercent}
                size={52}
                strokeWidth={5}
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

            <Link href={href} className="w-full sm:w-auto sm:shrink-0">
              <Button size="md" className="w-full sm:w-auto">
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

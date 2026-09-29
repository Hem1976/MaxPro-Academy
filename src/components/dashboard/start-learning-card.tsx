import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ProductVisual } from "@/components/brand/product-visual";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types/database";

export interface StartLearningCardProps {
  courses: Course[];
}

export function StartLearningCard({ courses }: StartLearningCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-linear-to-r from-navy to-accent px-4 py-5 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
          Start here
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Begin your learning path
        </h2>
        <p className="mt-1 max-w-xl text-sm text-white/75">
          Enroll in a course and this card becomes your one-click resume.
        </p>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
          {courses.map((course) => {
            const product = course.product;

            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group flex items-center gap-3 rounded-lg border border-border bg-surface/60 p-2.5 transition-colors hover:border-border-strong hover:bg-card focus-ring"
              >
                {product ? (
                  <ProductVisual
                    name={product.name}
                    category={product.category}
                    imageUrl={product.cover_image_url}
                    variant="thumb"
                    className="size-12 shrink-0 rounded-md"
                  />
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
                    <BookOpen className="size-5" aria-hidden="true" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground group-hover:text-accent">
                    {course.title}
                  </p>
                  {course.short_description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {course.short_description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-5">
          <Link href="/courses">
            <Button size="md">Browse courses</Button>
          </Link>
        </div>
      )}
    </article>
  );
}

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { ProductVisual } from "@/components/brand/product-visual";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  title: string;
  description?: string;
  href: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
  category?: string | null;
  courseCount?: number;
  ctaLabel?: string;
  className?: string;
}

export function ProductCard({
  title,
  description,
  href,
  imageUrl,
  logoUrl,
  category,
  courseCount,
  ctaLabel = "View details",
  className,
}: ProductCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-border-strong",
        className,
      )}
    >
      <ProductVisual
        name={title}
        category={category}
        shortDescription={description}
        imageUrl={imageUrl}
        logoUrl={logoUrl}
        variant="card"
        className="rounded-none border-0"
      />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {category && (
          <p className="text-xs font-medium text-muted">{category}</p>
        )}
        <h3 className="mt-1 font-semibold text-foreground group-hover:text-accent">
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          {courseCount !== undefined && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="size-3.5" aria-hidden="true" />
              {courseCount} {courseCount === 1 ? "course" : "courses"}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium text-accent",
              courseCount === undefined && "ml-auto",
            )}
          >
            {ctaLabel}
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

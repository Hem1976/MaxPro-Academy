import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** Compact inline empty state (~300px max visual height) */
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
  compact = true,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start rounded-lg border border-border bg-surface/60 px-5 text-left sm:px-6",
        compact ? "py-6 sm:py-8" : "items-center py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-3 text-muted",
            compact ? "[&>svg]:size-5" : "mb-4 [&>svg]:size-8",
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3
        className={cn(
          "font-semibold text-foreground",
          compact ? "text-base" : "text-lg",
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "mt-1.5 text-sm text-muted-foreground",
            compact ? "max-w-xl" : "max-w-sm",
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

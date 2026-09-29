import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BuilderSectionProps {
  step: number;
  title: string;
  description: string;
  id?: string;
  className?: string;
  children: ReactNode;
}

export function BuilderSection({
  step,
  title,
  description,
  id,
  className,
  children,
}: BuilderSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">
        Step {step}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

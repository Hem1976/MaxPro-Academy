import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared max width + horizontal padding for authenticated learner UI. */
export const learnerPageMaxClass = "mx-auto w-full max-w-[100rem]";
export const learnerPagePaddingClass =
  "w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12";

export function learnerShellClassName(className?: string) {
  return cn(learnerPageMaxClass, learnerPagePaddingClass, className);
}

export interface LearnerPageProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Full-height learner page shell (surface background). */
export function LearnerPage({ children, className, ...props }: LearnerPageProps) {
  return (
    <div
      className={cn("flex min-h-full flex-1 flex-col bg-surface", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface LearnerPageContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Padded content column inside a learner page. */
export function LearnerPageContent({
  children,
  className,
  ...props
}: LearnerPageContentProps) {
  return (
    <div
      className={cn(
        learnerShellClassName(),
        "flex flex-1 flex-col py-5 sm:py-6 lg:py-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface LearnerPageBleedProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Full-width band (e.g. dashboard hero) with inner alignment to the learner shell. */
export function LearnerPageBleed({
  children,
  className,
  ...props
}: LearnerPageBleedProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  );
}

export interface LearnerPageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function LearnerPageHeader({
  title,
  description,
  className,
}: LearnerPageHeaderProps) {
  return (
    <header className={cn("mb-6 sm:mb-8", className)}>
      <h1 className="text-2xl font-semibold tracking-tight text-navy dark:text-foreground sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}

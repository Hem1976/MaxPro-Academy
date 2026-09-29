import { type HTMLAttributes } from "react";
import { learnerShellClassName } from "@/components/layout/learner-page";
import { cn } from "@/lib/utils";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide" | "learner";
}

const sizeClasses = {
  default: "container-max",
  narrow: "mx-auto w-full max-w-3xl px-4 sm:px-6",
  wide: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
  learner: learnerShellClassName(),
};

export function Container({
  size = "default",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div className={cn(sizeClasses[size], className)} {...props}>
      {children}
    </div>
  );
}

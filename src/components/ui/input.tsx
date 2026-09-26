import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border bg-input-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus-ring disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-destructive focus-visible:outline-destructive"
          : "border-input focus-visible:border-primary",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

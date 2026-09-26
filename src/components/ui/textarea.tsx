import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border bg-input-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted focus-ring disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-destructive focus-visible:outline-destructive"
          : "border-input focus-visible:border-primary",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

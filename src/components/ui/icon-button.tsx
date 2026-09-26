import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-accent-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-border",
        ghost: "text-muted-foreground hover:bg-surface hover:text-foreground",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface",
        danger:
          "text-destructive hover:bg-destructive/10",
      },
      size: {
        sm: "size-8 rounded-md",
        md: "size-10 rounded-md",
        lg: "size-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, label, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  ),
);

IconButton.displayName = "IconButton";

export { iconButtonVariants };

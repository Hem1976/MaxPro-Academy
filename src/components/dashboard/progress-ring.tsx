import { cn } from "@/lib/utils";

export interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  textClassName?: string;
}

export function ProgressRing({
  value,
  size = 72,
  strokeWidth = 7,
  label,
  className,
  trackClassName,
  indicatorClassName,
  textClassName,
}: ProgressRingProps) {
  const percent = Math.round(Math.max(0, Math.min(100, value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="img"
      aria-label={label ?? `${percent}% complete`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn("stroke-border", trackClassName)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "stroke-primary transition-[stroke-dashoffset] duration-500",
            indicatorClassName,
          )}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span
        className={cn(
          "absolute text-sm font-semibold tabular-nums text-foreground",
          textClassName,
        )}
      >
        {percent}%
      </span>
    </div>
  );
}

import Image from "next/image";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
};

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function Avatar({
  src,
  alt,
  name = "",
  size = "md",
  className,
}: AvatarProps) {
  const initials = getInitials(name || alt || "?");

  if (src) {
    const altText = alt || name || "Avatar";
    if (src.startsWith("data:")) {
      return (
        <img
          src={src}
          alt={altText}
          className={cn(
            "rounded-md object-cover",
            sizeClasses[size],
            className,
          )}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={altText}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className={cn(
          "rounded-md object-cover",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt || name || "Avatar"}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-navy font-medium text-navy-foreground",
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}

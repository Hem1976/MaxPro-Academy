import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  /** `mark` = compact header size; `full` = larger with more presence */
  variant?: "default" | "academy" | "mark" | "full";
  href?: string;
  className?: string;
  /** Show tagline version — always true for Academy logo asset */
  priority?: boolean;
}

/** Corporate lockup — `public/MAXPRO.png` */
const LOGO_SRC = "/MAXPRO.png";

/** Intrinsic ratio of MAXPRO logo (738×210) */
const LOGO_ASPECT = 738 / 210;

export function Logo({
  variant = "academy",
  href = "/",
  className,
  priority = false,
}: LogoProps) {
  const height =
    variant === "full" ? 52 : variant === "mark" ? 30 : 40;
  const width = Math.round(height * LOGO_ASPECT);

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90"
      aria-label="Maxpro — We mind your growth"
    >
      <Image
        src={LOGO_SRC}
        alt="Maxpro"
        width={width}
        height={height}
        priority={priority}
        className={cn(
          "h-auto w-auto max-w-full object-contain object-left",
          className,
        )}
        style={{ height, width: "auto", maxHeight: height }}
      />
    </Link>
  );
}

import { cn } from "@/lib/utils";

export type ProductVisualVariant = "card" | "hero" | "thumb" | "inline";

export interface ProductVisualProps {
  name: string;
  category?: string | null;
  shortDescription?: string | null;
  imageUrl?: string | null;
  logoUrl?: string | null;
  variant?: ProductVisualVariant;
  className?: string;
}

/** Deterministic accent from product name — navy family only, no purple. */
function accentForName(name: string): { panel: string; line: string; glow: string } {
  const accents = [
    { panel: "#0B1F3A", line: "#2F6FAD", glow: "#1E4A7A" },
    { panel: "#0E2744", line: "#3A7AB5", glow: "#1E4A7A" },
    { panel: "#102A4A", line: "#4A8BC4", glow: "#244F7A" },
    { panel: "#0C223D", line: "#5A9AD0", glow: "#1E4A7A" },
    { panel: "#0A1C36", line: "#2A65A0", glow: "#163A5C" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % accents.length;
  }
  return accents[hash] ?? accents[0];
}

/**
 * Branded product visual. Uses a real image when available;
 * otherwise renders a CSS product-UI composition (no "No image").
 */
export function ProductVisual({
  name,
  category,
  shortDescription,
  imageUrl,
  logoUrl,
  variant = "card",
  className,
}: ProductVisualProps) {
  const accent = accentForName(name);
  const aspect =
    variant === "hero"
      ? "aspect-[16/10]"
      : variant === "thumb"
        ? "aspect-square"
        : variant === "inline"
          ? "aspect-[16/9]"
          : "aspect-[16/9]";

  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-border bg-navy",
          aspect,
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border",
        aspect,
        className,
      )}
      style={{ background: accent.panel }}
      aria-hidden={variant !== "hero"}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* UI panel composition */}
      <div className="absolute inset-0 flex flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="size-6 rounded object-contain" />
            ) : (
              <span
                className="flex size-6 items-center justify-center rounded text-[10px] font-semibold text-white"
                style={{ background: accent.line }}
              >
                {name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="text-[11px] font-medium tracking-wide text-white/70">
              MAXPRO
            </span>
          </div>
          <div className="flex gap-1">
            <span className="size-1.5 rounded-full bg-white/30" />
            <span className="size-1.5 rounded-full bg-white/30" />
            <span className="size-1.5 rounded-full bg-white/30" />
          </div>
        </div>

        <div className="mt-4 flex flex-1 gap-3">
          {/* Sidebar mock */}
          <div className="hidden w-16 shrink-0 flex-col gap-1.5 sm:flex">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-2 rounded-sm bg-white/10"
                style={i === 1 ? { background: accent.line, opacity: 0.7 } : undefined}
              />
            ))}
          </div>

          {/* Main panel */}
          <div className="flex flex-1 flex-col rounded-md border border-white/10 bg-white/[0.04] p-3">
            <p className="text-sm font-semibold tracking-tight text-white sm:text-base">
              {name}
            </p>
            {category && (
              <p className="mt-0.5 text-[11px] text-white/55">{category}</p>
            )}
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-4/5 rounded-sm bg-white/15" />
              <div className="h-1.5 w-3/5 rounded-sm bg-white/10" />
              <div className="h-1.5 w-2/3 rounded-sm bg-white/10" />
            </div>
            <div className="mt-auto flex gap-2 pt-3">
              <div
                className="h-6 w-16 rounded-md"
                style={{ background: accent.line, opacity: 0.85 }}
              />
              <div className="h-6 w-12 rounded-md border border-white/15" />
            </div>
          </div>
        </div>

        {shortDescription && variant === "hero" && (
          <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-white/50">
            {shortDescription}
          </p>
        )}
      </div>
    </div>
  );
}

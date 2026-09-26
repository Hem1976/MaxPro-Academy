import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductScreenshot } from "@/lib/data/product-media";

export interface ProductScreenshotGalleryProps {
  screenshots: ProductScreenshot[];
  productName: string;
  className?: string;
}

export function ProductScreenshotGallery({
  screenshots,
  productName,
  className,
}: ProductScreenshotGalleryProps) {
  if (screenshots.length === 0) return null;

  return (
    <section className={cn("mt-16", className)}>
      <h2 className="text-xl font-semibold tracking-tight text-navy">
        Inside {productName}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Real application screens used in training.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {screenshots.map((shot) => (
          <figure
            key={shot.src}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="relative aspect-[9/16] max-h-[420px] w-full bg-surface sm:aspect-[9/19] sm:max-h-[480px]">
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                className="object-contain object-top"
                sizes="(max-width: 640px) 100vw, 40vw"
              />
            </div>
            <figcaption className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
              {shot.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

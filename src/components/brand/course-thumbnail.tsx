import { cn } from "@/lib/utils";
import { ProductVisual } from "@/components/brand/product-visual";

export interface CourseThumbnailProps {
  productName: string;
  courseTitle: string;
  productCategory?: string | null;
  imageUrl?: string | null;
  className?: string;
}

/**
 * Consistent course thumbnail: product visual base with subtle course label.
 */
export function CourseThumbnail({
  productName,
  courseTitle,
  productCategory,
  imageUrl,
  className,
}: CourseThumbnailProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <ProductVisual
        name={productName}
        category={productCategory}
        imageUrl={imageUrl}
        variant="card"
        className="rounded-lg"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 via-navy/40 to-transparent px-3 pb-3 pt-10">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-white/90">
          {courseTitle}
        </p>
      </div>
    </div>
  );
}

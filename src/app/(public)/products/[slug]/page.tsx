import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductVisual } from "@/components/brand/product-visual";
import { CourseCard } from "@/components/course/course-card";
import { ProductScreenshotGallery } from "@/components/course/product-screenshot-gallery";
import { FadeIn } from "@/components/marketing/fade-in";
import { getOrderedLessonsForCourse } from "@/lib/data/demo-store";
import { getProductMedia } from "@/lib/data/product-media";
import {
  getAllProductSlugs,
  getCoursesByProduct,
  getProductBySlug,
} from "@/lib/data/queries";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Solution not found" };
  }

  return {
    title: product.name,
    description:
      product.short_description ??
      `Training courses for ${product.name} on Maxpro Academy.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product || !product.published) {
    notFound();
  }

  const courses = getCoursesByProduct(slug);
  const media = getProductMedia(slug);
  const coverUrl = product.cover_image_url ?? media?.coverUrl ?? null;
  const logoUrl = product.logo_url ?? media?.logoUrl ?? null;
  const screenshots = media?.screenshots ?? [];
  const longDescription =
    product.description &&
    product.description !== product.short_description
      ? product.description
      : null;

  return (
    <Container className="py-12 lg:py-16">
      <Breadcrumb
        items={[
          { label: "Solutions", href: "/products" },
          { label: product.name },
        ]}
        className="mb-8"
      />

      <FadeIn>
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductVisual
            name={product.name}
            category={product.category}
            shortDescription={product.short_description}
            imageUrl={coverUrl}
            logoUrl={logoUrl}
            variant="hero"
          />

          <header>
            <div className="flex items-start gap-3">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-lg border border-border object-contain"
                />
              ) : null}
              <div>
                {product.category ? (
                  <p className="text-sm font-medium text-muted">
                    {product.category}
                  </p>
                ) : null}
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
                  {product.name}
                </h1>
              </div>
            </div>
            {product.short_description ? (
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {product.short_description}
              </p>
            ) : null}
            {courses.length > 0 ? (
              <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                <BookOpen className="size-4" aria-hidden="true" />
                {courses.length}{" "}
                {courses.length === 1 ? "course" : "courses"} available
              </p>
            ) : null}
          </header>
        </div>

        {longDescription ? (
          <div className="mt-8 max-w-3xl whitespace-pre-line leading-relaxed text-muted-foreground">
            {longDescription}
          </div>
        ) : null}
      </FadeIn>

      <ProductScreenshotGallery
        screenshots={screenshots}
        productName={product.name}
      />

      <section className="mt-16">
        <FadeIn>
          <h2 className="text-xl font-semibold tracking-tight text-navy">
            Learning paths
          </h2>
          <p className="mt-2 text-muted-foreground">
            Structured courses for {product.name}, from fundamentals through
            advanced workflows.
          </p>
        </FadeIn>

        {courses.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {courses.map((course, index) => {
              const lessonCount = getOrderedLessonsForCourse(course.id).length;
              return (
                <FadeIn key={course.id} delay={index * 0.04}>
                  <CourseCard
                    title={course.title}
                    description={course.short_description ?? undefined}
                    href={`/courses/${course.slug}`}
                    productName={product.name}
                    thumbnailUrl={course.thumbnail_url ?? coverUrl}
                    durationMinutes={course.estimated_minutes}
                    lessonCount={lessonCount}
                    level={course.level}
                    certificateEnabled={course.certificate_enabled}
                  />
                </FadeIn>
              );
            })}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="No courses yet"
              description={`Training for ${product.name} will appear here once published.`}
              icon={<BookOpen className="size-5" />}
            />
          </div>
        )}
      </section>
    </Container>
  );
}

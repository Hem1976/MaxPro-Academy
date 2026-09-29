import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/course/product-card";
import { FadeIn } from "@/components/marketing/fade-in";
import {
  getCoursesByProduct,
  getPublishedProducts,
} from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Browse Maxpro Academy training organized by solution — Rockey, RocketSales, RocketVan, RocketBI, and more.",
};

export default function ProductsPage() {
  const products = getPublishedProducts();

  return (
    <Container className="py-12 lg:py-16">
      <FadeIn>
        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            Solutions
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Training content organized by Maxpro software solution. Select a
            solution to see available courses and learning paths.
          </p>
        </header>
      </FadeIn>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <FadeIn key={product.id} delay={index * 0.04}>
            <ProductCard
              title={product.name}
              description={product.short_description ?? undefined}
              href={`/products/${product.slug}`}
              imageUrl={product.cover_image_url}
              logoUrl={product.logo_url}
              category={product.category}
              courseCount={getCoursesByProduct(product.slug).length}
              ctaLabel="View courses"
            />
          </FadeIn>
        ))}
      </div>
    </Container>
  );
}

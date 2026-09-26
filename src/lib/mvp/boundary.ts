/**
 * Maxpro Academy MVP v1 product catalog.
 * Only these four products are published for launch.
 *
 * Order AI, Van, Pulse, Kingo, BI remain in data as unpublished
 * so Admin can enable them later without schema changes.
 */

import type { Product } from "@/types/database";

const TIMESTAMP = "2026-01-15T10:00:00.000Z";

/** Canonical MVP product IDs */
export const MVP_PRODUCT_IDS = {
  rockey: "11111111-1111-1111-1111-111111111101",
  rocketsales: "11111111-1111-1111-1111-111111111102",
  rocketsalesPharma: "11111111-1111-1111-1111-111111111103",
  rockeyAgro: "11111111-1111-1111-1111-111111111109",
} as const;

export function applyMvpProductFlags(products: Product[]): Product[] {
  const mvpSlugs = new Set([
    "rockey",
    "rocketsales",
    "rocketsales-pharma",
    "rockey-agro",
  ]);

  return products.map((product) => {
    const isMvp = mvpSlugs.has(product.slug);
    if (product.slug === "rockey") {
      return { ...product, published: true, featured: true, sort_order: 1 };
    }
    if (product.slug === "rocketsales") {
      return {
        ...product,
        published: true,
        featured: true,
        sort_order: 2,
        short_description:
          "Omni sales, productivity and reporting SFA app for field teams.",
      };
    }
    if (product.slug === "rocketsales-pharma") {
      return { ...product, published: true, featured: true, sort_order: 3 };
    }
    if (product.slug === "rockey-agro") {
      return { ...product, published: true, featured: true, sort_order: 4 };
    }
    if (!isMvp) {
      return {
        ...product,
        published: false,
        featured: false,
        sort_order: product.sort_order + 100,
      };
    }
    return product;
  });
}

export const MVP_BOUNDARY = {
  products: "full-catalog",
  fundamentalsCourses: 4,
  videosRequired: false,
  includeCertificates: true,
  includeCertificateVerification: true,
  exclude: [
    "organizations",
    "team-assignments",
    "ai-assistant",
    "video-hosting",
    "gamification",
    "semantic-search",
    "manager-dashboards",
  ],
} as const;

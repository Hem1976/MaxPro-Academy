/**
 * Local product media assets under /public/products/{slug}/
 * Keeps UI data-driven without hardcoding product-specific JSX branches.
 */

export interface ProductScreenshot {
  src: string;
  alt: string;
  caption: string;
}

export interface ProductMedia {
  logoUrl: string | null;
  coverUrl: string | null;
  screenshots: ProductScreenshot[];
}

const MEDIA: Record<string, ProductMedia> = {
  rockey: {
    logoUrl: "/products/rockey/logo.png",
    coverUrl: "/products/rockey/cover.png",
    screenshots: [
      {
        src: "/products/rockey/screenshot-dashboard.jpeg",
        alt: "Rockey home dashboard",
        caption: "Home dashboard — customers, products, visits, and sales at a glance",
      },
      {
        src: "/products/rockey/screenshot-customers.jpeg",
        alt: "Rockey customers list",
        caption: "Customers — search, review, and manage customer records",
      },
      {
        src: "/products/rockey/screenshot-reports.jpeg",
        alt: "Rockey reports menu",
        caption: "Reports — sales, orders, stock requests, and field activity",
      },
      {
        src: "/products/rockey/screenshot-stock-request.jpeg",
        alt: "Rockey stock request screen",
        caption: "Stock request — search products and enter quantities",
      },
    ],
  },
  "rocketsales-pharma": {
    logoUrl: "/products/rocketsales-pharma/logo.png",
    coverUrl: "/products/rocketsales-pharma/cover.png",
    screenshots: [
      {
        src: "/products/rocketsales-pharma/screenshot-dashboard.jpeg",
        alt: "RocketSales Pharma home dashboard",
        caption: "Home dashboard — customers, doctors, visits, and orders",
      },
      {
        src: "/products/rocketsales-pharma/screenshot-reports.jpeg",
        alt: "RocketSales Pharma reports",
        caption: "Reports — visits, detailing, samples, gifts, orders, and route plan",
      },
      {
        src: "/products/rocketsales-pharma/screenshot-service-calls.jpeg",
        alt: "RocketSales Pharma service calls",
        caption: "Service Calls — track and manage field service activity",
      },
      {
        src: "/products/rocketsales-pharma/screenshot-question-bank.jpeg",
        alt: "RocketSales Pharma question bank",
        caption: "In-app learning — confirm how orders can be placed",
      },
    ],
  },
  "rocket-order-ai": {
    logoUrl: null,
    coverUrl: "/products/rocket-order-ai/cover.png",
    screenshots: [],
  },
  "rockey-agro": {
    logoUrl: "/products/rockey-agro/logo.png",
    coverUrl: "/products/rockey-agro/cover.png",
    screenshots: [],
  },
};

export function getProductMedia(slug: string): ProductMedia | null {
  return MEDIA[slug] ?? null;
}

export function getProductScreenshots(slug: string): ProductScreenshot[] {
  return MEDIA[slug]?.screenshots ?? [];
}

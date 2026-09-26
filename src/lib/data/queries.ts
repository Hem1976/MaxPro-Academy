import type { Course, Product } from "@/types/database";
import {
  getCourseWithModules,
  getCourses,
  getProductBySlug as getProductBySlugFromStore,
  getProducts,
  type CourseWithModules,
} from "./demo-store";

export type { CourseWithModules };

export function getPublishedProducts(): Product[] {
  return getProducts({ publishedOnly: true });
}

export function getFeaturedProducts(): Product[] {
  return getProducts({ publishedOnly: true, featuredOnly: true });
}

export function getPublishedCourses(options?: {
  level?: string;
  featuredOnly?: boolean;
}): Course[] {
  const courses = getCourses({
    publishedOnly: true,
    featuredOnly: options?.featuredOnly,
  });

  if (options?.level) {
    return courses.filter((course) => course.level === options.level);
  }

  return courses;
}

export function getProductBySlug(slug: string): Product | null {
  return getProductBySlugFromStore(slug);
}

export function getCourseBySlugDetailed(
  slug: string,
): CourseWithModules | null {
  return getCourseWithModules(slug);
}

export function getCoursesByProduct(productSlug: string): Course[] {
  return getCourses({ productSlug, publishedOnly: true });
}

export function getAllProductSlugs(): string[] {
  return getPublishedProducts().map((product) => product.slug);
}

export function getAllCourseSlugs(): string[] {
  return getPublishedCourses().map((course) => course.slug);
}

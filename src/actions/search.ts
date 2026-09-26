"use server";

import {
  isSupabaseConfigured,
  searchContent,
  type SearchResultItem,
} from "@/lib/data/demo-store";
import { createClient } from "@/lib/supabase/server";

export async function searchAcademy(query: string): Promise<SearchResultItem[]> {
  const normalized = query.trim();
  if (!normalized) {
    return [];
  }

  if (!isSupabaseConfigured()) {
    return searchContent(normalized);
  }

  const supabase = await createClient();
  const pattern = `%${normalized}%`;
  const results: SearchResultItem[] = [];

  const { data: productRows } = await supabase
    .from("products")
    .select("id, name, slug, short_description")
    .or(
      `name.ilike.${pattern},slug.ilike.${pattern},short_description.ilike.${pattern}`,
    )
    .limit(10);

  for (const product of productRows ?? []) {
    results.push({
      type: "product",
      id: product.id,
      title: product.name,
      slug: product.slug,
      description: product.short_description,
    });
  }

  const { data: courseRows } = await supabase
    .from("courses")
    .select("id, title, slug, short_description, product_id, products(name, slug)")
    .or(
      `title.ilike.${pattern},slug.ilike.${pattern},short_description.ilike.${pattern}`,
    )
    .limit(10);

  for (const course of courseRows ?? []) {
    const product = course.products as unknown as { name: string; slug: string } | null;
    results.push({
      type: "course",
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.short_description,
      productSlug: product?.slug,
      productName: product?.name,
    });
  }

  const { data: lessonRows } = await supabase
    .from("lessons")
    .select(
      "id, title, slug, description, modules(course_id, courses(title, slug, product_id, products(name, slug)))",
    )
    .or(`title.ilike.${pattern},slug.ilike.${pattern},description.ilike.${pattern}`)
    .limit(10);

  for (const lesson of lessonRows ?? []) {
    const module = lesson.modules as unknown as {
      course_id: string;
      courses: {
        title: string;
        slug: string;
        products: { name: string; slug: string } | null;
      };
    } | null;
    const course = module?.courses;

    results.push({
      type: "lesson",
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      courseSlug: course?.slug,
      courseTitle: course?.title,
      productSlug: course?.products?.slug,
      productName: course?.products?.name,
    });
  }

  return results.slice(0, 20);
}

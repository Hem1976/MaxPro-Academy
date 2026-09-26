import type { Metadata } from "next";
import { CourseForm } from "@/components/admin/course-form";
import { getProducts } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "New Course | Admin",
};

export default function NewCoursePage() {
  const products = getProducts({ publishedOnly: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-navy">New course</h1>
      <CourseForm products={products} />
    </div>
  );
}

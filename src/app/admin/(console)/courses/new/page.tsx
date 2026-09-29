import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CourseForm } from "@/components/admin/course-form";
import { getProducts } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "New Course | Admin",
};

export default function NewCoursePage() {
  const products = getProducts({ publishedOnly: false });

  return (
    <div className="w-full">
      <AdminPageHeader
        title="New course"
        description="Add basics first. After save, you can add videos and publish."
      />
      <CourseForm products={products} />
    </div>
  );
}

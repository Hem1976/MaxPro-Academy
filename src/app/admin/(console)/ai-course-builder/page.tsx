import type { Metadata } from "next";
import { AiCourseBuilder } from "@/components/admin/ai-course-builder";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getProducts } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "AI Course Builder | Admin",
  description:
    "Draft Maxpro Academy courses, lessons, and quizzes with local AI (Ollama).",
};

export default function AiCourseBuilderPage() {
  const products = getProducts({ publishedOnly: false }).sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return (
    <div className="w-full">
      <AdminPageHeader
        title="AI Course Builder"
        description="Describe a course. AI drafts modules, lessons, and a quiz. Review, then save."
      />

      <AiCourseBuilder products={products} />
    </div>
  );
}

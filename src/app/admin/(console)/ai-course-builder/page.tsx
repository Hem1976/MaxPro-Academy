import type { Metadata } from "next";
import { AiCourseBuilder } from "@/components/admin/ai-course-builder";
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
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-navy">AI Course Builder</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Generate a full course draft with local AI (Ollama / llama and other
          models): course name, modules, written walkthrough lessons, and a
          final knowledge check. Review before saving into the Academy CMS.
        </p>
      </header>

      <AiCourseBuilder products={products} />
    </div>
  );
}

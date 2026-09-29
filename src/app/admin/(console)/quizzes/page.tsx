import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/ui/data-table";
import {
  getAllDemoQuizzes,
  getLessonById,
  getQuizById,
} from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Quizzes | Admin",
};

export default function AdminQuizzesPage() {
  const quizzes = getAllDemoQuizzes();

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Quizzes"
        description="All quizzes. Easiest to add them inside a course."
      />

      <DataTable
        data={quizzes}
        keyExtractor={(row) => row.id}
        emptyMessage="No quizzes yet."
        columns={[
          {
            key: "title",
            header: "Title",
            cell: (row) => row.title,
          },
          {
            key: "lesson",
            header: "Lesson",
            hideOnMobile: true,
            cell: (row) => {
              const lesson = getLessonById(row.lesson_id);
              if (!lesson) return "—";
              return (
                <Link
                  href={`/admin/lessons/${lesson.id}`}
                  className="text-accent hover:underline"
                >
                  {lesson.title}
                </Link>
              );
            },
          },
          {
            key: "passing",
            header: "Pass %",
            cell: (row) => `${row.passing_score}%`,
          },
          {
            key: "questions",
            header: "Questions",
            hideOnMobile: true,
            cell: (row) => getQuizById(row.id)?.questions.length ?? 0,
          },
        ]}
      />
    </div>
  );
}

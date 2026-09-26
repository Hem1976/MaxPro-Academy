import type { Metadata } from "next";
import Link from "next/link";
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-navy">Quizzes</h1>
        <p className="text-sm text-muted-foreground">
          Knowledge checks attached to lessons.
        </p>
      </div>

      <DataTable
        data={quizzes}
        keyExtractor={(row) => row.id}
        emptyMessage="No quizzes yet. Create quizzes from lesson editors."
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
              return lesson ? (
                <Link
                  href={`/admin/lessons/${lesson.id}`}
                  className="text-accent hover:underline"
                >
                  {lesson.title}
                </Link>
              ) : (
                "—"
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

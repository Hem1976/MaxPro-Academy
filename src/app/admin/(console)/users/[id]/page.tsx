import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BookOpen, CheckCircle2, ClipboardList } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LearnerStatusBadge } from "@/components/admin/learner-analytics-table";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { getLearnerAnalyticsDetail } from "@/lib/data/demo-store";

interface AdminLearnerPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: AdminLearnerPageProps): Promise<Metadata> {
  const { id } = await params;
  const learner = getLearnerAnalyticsDetail(id);

  return {
    title: learner
      ? `${learner.fullName} | Learner analytics`
      : "Learner not found",
  };
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminLearnerPage({ params }: AdminLearnerPageProps) {
  const { id } = await params;
  const learner = getLearnerAnalyticsDetail(id);

  if (!learner) {
    notFound();
  }

  return (
    <div className="w-full">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Users", href: "/admin/users" },
          { label: learner.fullName },
        ]}
        className="mb-6"
      />

      <AdminPageHeader
        title={learner.fullName}
        description={
          <>
            {learner.email}
            {learner.jobTitle ? ` · ${learner.jobTitle}` : ""}
            {learner.company ? ` · ${learner.company}` : ""}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Courses enrolled"
          value={learner.enrolledCourses}
          icon={<BookOpen className="size-5" />}
        />
        <StatCard
          label="In progress"
          value={learner.inProgressCourses}
          change={`${learner.completedCourses} completed`}
        />
        <StatCard
          label="Average progress"
          value={`${learner.averageProgress}%`}
          icon={<ClipboardList className="size-5" />}
        />
        <StatCard
          label="Certificates"
          value={learner.certificates}
          change={`${learner.quizzesPassed} quizzes passed`}
          icon={<Award className="size-5" />}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          Course progress
        </h2>
        {learner.courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This user has not enrolled in any courses yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {learner.courses.map((course) => (
              <li
                key={course.courseId}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/courses/${course.courseId}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {course.courseTitle}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {course.completedRequired} of {course.totalRequired}{" "}
                      required items · enrolled {formatDate(course.enrolledAt)}
                    </p>
                  </div>
                  <LearnerStatusBadge
                    status={course.status}
                    percent={course.percent}
                  />
                </div>
                <ProgressBar
                  value={course.percent}
                  showValue
                  size="sm"
                  className="mt-3"
                  label={`${course.courseTitle} progress`}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {course.quizPassed === null ? (
                    <Badge variant="outline">No quiz</Badge>
                  ) : course.quizPassed ? (
                    <Badge variant="success">Quiz passed</Badge>
                  ) : (
                    <Badge variant="warning">Quiz not passed</Badge>
                  )}
                  {course.completedAt && (
                    <Badge variant="secondary">
                      Finished {formatDate(course.completedAt)}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          Quiz attempts
        </h2>
        {learner.quizAttemptsList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No quiz attempts yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {learner.quizAttemptsList.map((attempt, index) => (
              <li
                key={`${attempt.quizId}-${attempt.attemptedAt}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{attempt.quizTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {attempt.courseTitle} · {formatDate(attempt.attemptedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {attempt.score}%
                  </span>
                  {attempt.passed ? (
                    <span className="inline-flex items-center gap-1 text-sm text-success">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      Passed
                    </span>
                  ) : (
                    <Badge variant="warning">Not passed</Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

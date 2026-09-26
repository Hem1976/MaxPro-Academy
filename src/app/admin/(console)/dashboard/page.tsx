import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Film,
  GraduationCap,
  Users,
} from "lucide-react";
import { LearnerAnalyticsTable } from "@/components/admin/learner-analytics-table";
import { MetricsChart } from "@/components/admin/metrics-chart";
import { StatCard } from "@/components/ui/stat-card";
import {
  getAdminMetrics,
  getAnalyticsSummary,
  getContentHealthIssues,
  getLearnerAnalyticsSummaries,
} from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Admin Dashboard | Maxpro Academy",
};

export default function AdminDashboardPage() {
  const metrics = getAdminMetrics();
  const analytics = getAnalyticsSummary();
  const healthIssues = getContentHealthIssues();
  const learners = getLearnerAnalyticsSummaries();
  const learnersWithCourses = learners.filter((item) => item.enrolledCourses > 0);
  const learnersInProgress = learners.filter((item) => item.inProgressCourses > 0)
    .length;
  const averageLearnerProgress =
    learnersWithCourses.length > 0
      ? Math.round(
          learnersWithCourses.reduce(
            (sum, item) => sum + item.averageProgress,
            0,
          ) / learnersWithCourses.length,
        )
      : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Academy metrics from live content and learner activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Published courses"
          value={metrics.publishedCourses}
          icon={<BookOpen className="size-5" />}
        />
        <StatCard
          label="Lessons"
          value={metrics.totalLessons}
          change={`${metrics.publishedLessons} published`}
        />
        <StatCard
          label="Learners"
          value={metrics.learners}
          change={`${learnersInProgress} currently in progress`}
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Completions"
          value={metrics.completions}
          change={`${metrics.certificatesIssued} certificates`}
          icon={<Award className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <MetricsChart
          title="Enrollments by course"
          items={analytics.enrollmentStats.map((item) => ({
            label: item.courseTitle,
            value: item.enrollments,
          }))}
          emptyMessage="No enrollments recorded yet."
        />
        <MetricsChart
          title="Completion rate by course (%)"
          items={analytics.enrollmentStats.map((item) => ({
            label: item.courseTitle,
            value: item.completionRate,
            max: 100,
          }))}
          emptyMessage="No completion data yet."
        />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Learner analytics
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each learner’s enrolled courses, progress, and completions.
              Average progress across active learners: {averageLearnerProgress}%.
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className="shrink-0 text-sm font-medium text-accent hover:underline"
          >
            Full analytics
          </Link>
        </div>
        <LearnerAnalyticsTable learners={learners} />
      </section>

      <section className="mt-8 rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Content health
            </h2>
            <p className="text-sm text-muted-foreground">
              {healthIssues.length === 0
                ? "No issues detected."
                : `${healthIssues.length} item(s) need attention.`}
            </p>
          </div>
          <Link
            href="/admin/content-health"
            className="text-sm font-medium text-accent hover:underline"
          >
            View all
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
          >
            <Film className="size-4" />
            Upload videos & quizzes
          </Link>
          <Link
            href="/admin/ai-course-builder"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
          >
            <GraduationCap className="size-4" />
            AI Course Builder
          </Link>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
          >
            New course
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
          >
            New product
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
          >
            Manage users
          </Link>
        </div>
      </section>
    </div>
  );
}

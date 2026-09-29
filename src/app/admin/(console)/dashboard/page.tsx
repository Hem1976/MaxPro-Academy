import type { Metadata } from "next";
import {
  Award,
  BookOpen,
  Film,
  GraduationCap,
  Package,
  Users,
} from "lucide-react";
import { AdminButtonLink } from "@/components/admin/admin-button-link";
import {
  AdminPageHeader,
  AdminSectionHeader,
} from "@/components/admin/admin-page-header";
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
  const learnersInProgress = learners.filter((item) => item.inProgressCourses > 0)
    .length;

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Dashboard"
        description="Quick look at your academy."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Live courses"
          value={metrics.publishedCourses}
          icon={<BookOpen className="size-5" />}
          className="h-full"
        />
        <StatCard
          label="Lessons"
          value={metrics.totalLessons}
          change={`${metrics.publishedLessons} live`}
          className="h-full"
        />
        <StatCard
          label="Learners"
          value={metrics.learners}
          change={`${learnersInProgress} learning now`}
          icon={<Users className="size-5" />}
          className="h-full"
        />
        <StatCard
          label="Finished"
          value={metrics.completions}
          change={`${metrics.certificatesIssued} certs`}
          icon={<Award className="size-5" />}
          className="h-full"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <MetricsChart
          title="Sign-ups per course"
          items={analytics.enrollmentStats.map((item) => ({
            label: item.courseTitle,
            value: item.enrollments,
          }))}
          emptyMessage="No sign-ups yet."
        />
        <MetricsChart
          title="Finish rate (%)"
          items={analytics.enrollmentStats.map((item) => ({
            label: item.courseTitle,
            value: item.completionRate,
            max: 100,
          }))}
          emptyMessage="No finish data yet."
        />
      </div>

      <section className="mt-8 rounded-lg border border-border bg-card p-5 sm:p-6">
        <AdminSectionHeader
          title="Content to fix"
          description={
            healthIssues.length === 0
              ? "All good."
              : `${healthIssues.length} item${healthIssues.length === 1 ? "" : "s"} need a look.`
          }
          action={
            <AdminButtonLink href="/admin/content-health" size="md">
              Open list
            </AdminButtonLink>
          }
        />
      </section>

      <section className="mt-8">
        <AdminSectionHeader title="Shortcuts" />
        <div className="flex flex-wrap gap-2">
          <AdminButtonLink href="/admin/courses/new">
            <Film className="size-4" aria-hidden="true" />
            New course
          </AdminButtonLink>
          <AdminButtonLink href="/admin/courses">
            <BookOpen className="size-4" aria-hidden="true" />
            Courses
          </AdminButtonLink>
          <AdminButtonLink href="/admin/ai-course-builder">
            <GraduationCap className="size-4" aria-hidden="true" />
            AI builder
          </AdminButtonLink>
          <AdminButtonLink href="/admin/solutions/new">
            <Package className="size-4" aria-hidden="true" />
            New solution
          </AdminButtonLink>
          <AdminButtonLink href="/admin/users">
            <Users className="size-4" aria-hidden="true" />
            Users
          </AdminButtonLink>
        </div>
      </section>
    </div>
  );
}

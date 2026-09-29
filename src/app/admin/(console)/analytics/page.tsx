import type { Metadata } from "next";
import { AdminPageHeader, AdminSectionHeader } from "@/components/admin/admin-page-header";
import { LearnerAnalyticsTable } from "@/components/admin/learner-analytics-table";
import { MetricsChart } from "@/components/admin/metrics-chart";
import { StatCard } from "@/components/ui/stat-card";
import {
  getAnalyticsSummary,
  getLearnerAnalyticsSummaries,
} from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Analytics | Admin",
};

export default function AdminAnalyticsPage() {
  const analytics = getAnalyticsSummary();
  const learners = getLearnerAnalyticsSummaries();

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Stats"
        description="Who joined, who finished, and quiz scores."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sign-ups"
          value={analytics.totalEnrollments}
          className="h-full"
        />
        <StatCard
          label="Finished"
          value={analytics.totalCompletions}
          className="h-full"
        />
      </div>

      <section className="mb-8">
        <AdminSectionHeader title="Learners" />
        <LearnerAnalyticsTable learners={learners} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
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
        <MetricsChart
          title="Quiz pass rate (%)"
          items={analytics.quizPassStats.map((item) => ({
            label: item.quizTitle,
            value: item.passRate,
            max: 100,
          }))}
          emptyMessage="No quiz attempts yet."
        />
        <MetricsChart
          title="Quiz attempts"
          items={analytics.quizPassStats.map((item) => ({
            label: item.quizTitle,
            value: item.attempts,
          }))}
          emptyMessage="No quiz attempts yet."
        />
      </div>
    </div>
  );
}

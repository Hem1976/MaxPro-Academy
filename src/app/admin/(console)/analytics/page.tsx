import type { Metadata } from "next";
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
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-navy">Analytics</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard label="Total enrollments" value={analytics.totalEnrollments} />
        <StatCard label="Total completions" value={analytics.totalCompletions} />
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          By learner
        </h2>
        <LearnerAnalyticsTable learners={learners} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <MetricsChart
          title="Enrollments by course"
          items={analytics.enrollmentStats.map((item) => ({
            label: item.courseTitle,
            value: item.enrollments,
          }))}
          emptyMessage="No enrollment data yet."
        />
        <MetricsChart
          title="Completion rate (%)"
          items={analytics.enrollmentStats.map((item) => ({
            label: item.courseTitle,
            value: item.completionRate,
            max: 100,
          }))}
          emptyMessage="No completion data yet."
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

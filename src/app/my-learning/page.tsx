import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { LearnerDashboard } from "@/components/dashboard/learner-dashboard";
import { getLearnerDashboardPageContext } from "@/lib/dashboard/learner-dashboard-page";

export const metadata: Metadata = {
  title: "My Learning | Maxpro Academy",
  description: "Your enrolled courses and learning progress on Maxpro Academy.",
};

export default async function MyLearningPage() {
  const context = await getLearnerDashboardPageContext();

  if (!context) {
    return null;
  }

  return (
    <AppShell>
      <LearnerDashboard
        view="learning"
        greeting={context.greeting}
        greetingName={context.greetingName}
        data={context.data}
        startChoices={context.startChoices}
        exploreProducts={context.exploreProducts}
        continueCourse={context.continueCourse}
      />
    </AppShell>
  );
}

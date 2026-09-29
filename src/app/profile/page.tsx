import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import {
  LearnerPage,
  LearnerPageContent,
  LearnerPageHeader,
} from "@/components/layout/learner-page";
import { ProfileForm } from "@/components/profile/profile-form";
import { learningRoleLabel } from "@/lib/constants/learning-roles";
import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile | Maxpro Academy",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell>
      <LearnerPage>
        <LearnerPageContent>
          <LearnerPageHeader
            title="Profile"
            description="Manage your account details and learning preferences."
          />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
            <div className="rounded-lg border border-border bg-card p-4 text-sm sm:p-5">
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="font-medium text-foreground">{user.email}</span>
              </p>
              <p className="mt-2">
                <span className="text-muted-foreground">Current role:</span>{" "}
                <span className="font-medium text-foreground">
                  {learningRoleLabel(user.profile.learning_role)}
                </span>
              </p>
            </div>

            <ProfileForm profile={user.profile} />
          </div>
        </LearnerPageContent>
      </LearnerPage>
    </AppShell>
  );
}

import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/profile/profile-form";
import { Container } from "@/components/ui/container";
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
      <Container className="py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-navy dark:text-foreground">
            Profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account details and learning preferences.
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-border bg-surface p-4 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">Current role:</span>{" "}
            <span className="font-medium text-foreground">
              {learningRoleLabel(user.profile.learning_role)}
            </span>
          </p>
        </div>

        <ProfileForm profile={user.profile} />
      </Container>
    </AppShell>
  );
}

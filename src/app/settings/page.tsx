import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, ExternalLink, LifeBuoy, User } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { LearnerSignOutButton } from "@/components/settings/learner-sign-out-button";
import {
  SettingsCard,
  SettingsRow,
} from "@/components/settings/settings-card";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/get-user";
import { SITE_CONFIG } from "@/lib/config/site";
import { learningRoleLabel } from "@/lib/constants/learning-roles";
import { getPlatformSettingsSnapshot } from "@/lib/settings/platform";

export const metadata: Metadata = {
  title: "Settings | Maxpro Academy",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/settings");
  }

  const platform = getPlatformSettingsSnapshot();
  const displayName =
    user.profile.full_name?.trim() || user.email.split("@")[0];

  return (
    <AppShell>
      <Container className="max-w-2xl py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-navy dark:text-foreground">
            Settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Account, appearance, and help.
          </p>
        </div>

        <div className="space-y-6">
          <SettingsCard
            title="Account"
            description="Your sign-in and profile details."
          >
            <div className="space-y-3">
              <SettingsRow label="Name" value={displayName} />
              <SettingsRow label="Email" value={user.email} />
              {user.profile.learning_role ? (
                <SettingsRow
                  label="Learning role"
                  value={learningRoleLabel(user.profile.learning_role)}
                />
              ) : null}
            </div>
            <Link href="/profile" className="mt-4 inline-block">
              <Button variant="outline" size="md">
                <User className="size-4" aria-hidden="true" />
                Edit profile
              </Button>
            </Link>
          </SettingsCard>

          <SettingsCard title="Password">
            <p className="text-sm text-muted-foreground">
              We email you a link to choose a new password.
            </p>
            <Link href="/forgot-password" className="mt-4 inline-block">
              <Button variant="outline" size="md">Reset password</Button>
            </Link>
          </SettingsCard>

          <ThemeToggle />

          <SettingsCard title="How courses work">
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                Watch about{" "}
                <span className="font-medium text-foreground">
                  {platform.watchCompletionPercent}%
                </span>{" "}
                of each video lesson to mark it complete.
              </li>
              <li>Complete lessons and pass quizzes to finish a course.</li>
              <li>
                Earn a certificate when you finish a course that offers one.
              </li>
            </ul>
            <Link href="/certificates" className="mt-4 inline-block">
              <Button variant="outline" size="md">
                <Award className="size-4" aria-hidden="true" />
                My certificates
              </Button>
            </Link>
          </SettingsCard>

          <SettingsCard title="Support">
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  <LifeBuoy className="size-4" aria-hidden="true" />
                  Help center
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.supportEmail}`}
                  className="text-accent hover:underline"
                >
                  {SITE_CONFIG.supportEmail}
                </a>
              </li>
              <li>
                <a
                  href="https://maxproinfotech.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  {SITE_CONFIG.companyName}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </SettingsCard>

          <SettingsCard title="Sign out">
            <p className="text-sm text-muted-foreground">
              End your session on this device.
            </p>
            <div className="mt-4">
              <LearnerSignOutButton />
            </div>
          </SettingsCard>
        </div>
      </Container>
    </AppShell>
  );
}

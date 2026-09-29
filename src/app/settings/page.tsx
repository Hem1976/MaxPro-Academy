import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, ExternalLink, LifeBuoy } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import {
  LearnerPage,
  LearnerPageContent,
  LearnerPageHeader,
} from "@/components/layout/learner-page";
import { LearnerPersonalInformationForm } from "@/components/settings/learner-personal-information-form";
import { LearnerSignOutButton } from "@/components/settings/learner-sign-out-button";
import { SettingsCard } from "@/components/settings/settings-card";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/get-user";
import { SITE_CONFIG } from "@/lib/config/site";
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

  return (
    <AppShell>
      <LearnerPage>
        <LearnerPageContent>
          <LearnerPageHeader
            title="Settings"
            description="Account, appearance, and help."
          />

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <SettingsCard
              title="Personal information"
              description="Update your personal details and how others see you."
              className="lg:col-span-2"
            >
              <LearnerPersonalInformationForm
                profile={user.profile}
                email={user.email}
              />
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

            <SettingsCard title="How courses work" className="lg:col-span-2">
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
        </LearnerPageContent>
      </LearnerPage>
    </AppShell>
  );
}

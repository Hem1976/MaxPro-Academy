import type { Metadata } from "next";
import Link from "next/link";
import { AdminButtonLink } from "@/components/admin/admin-button-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  SettingsCard,
  SettingsRow,
} from "@/components/settings/settings-card";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { TranscriptionSettingsForm } from "@/components/settings/transcription-settings-form";
import { getCurrentUser } from "@/lib/auth/get-user";
import { staffRoleLabel } from "@/lib/auth/roles";
import { SITE_CONFIG } from "@/lib/config/site";
import { getPlatformSettingsSnapshot } from "@/lib/settings/platform";

export const metadata: Metadata = {
  title: "Settings | Admin",
};

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  const platform = getPlatformSettingsSnapshot();

  const displayName =
    user?.profile.full_name?.trim() ||
    user?.email.split("@")[0] ||
    "—";

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Settings"
        description="Your account, academy info, and how the site runs."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard
          title="Your account"
          description="Staff access to the admin console."
        >
          <div className="space-y-3">
            <SettingsRow label="Name" value={displayName} />
            <SettingsRow label="Email" value={user?.email ?? "—"} />
            <SettingsRow
              label="Role"
              value={staffRoleLabel(user?.profile.role)}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Academy"
          description="Public site details learners see."
        >
          <div className="space-y-3">
            <SettingsRow label="Site name" value={SITE_CONFIG.name} />
            <SettingsRow
              label="Support email"
              value={
                <a
                  href={`mailto:${SITE_CONFIG.supportEmail}`}
                  className="text-accent hover:underline"
                >
                  {SITE_CONFIG.supportEmail}
                </a>
              }
            />
            <SettingsRow
              label="Learner site"
              value={
                <Link
                  href={platform.appUrl}
                  className="break-all text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {platform.appUrl}
                </Link>
              }
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Learner rules"
          description="Defaults applied to all learners."
        >
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              Watch{" "}
              <span className="font-medium text-foreground">
                {platform.watchCompletionPercent}%
              </span>{" "}
              of a lesson video to mark it done.
            </li>
            <li>Pass the course quiz where one is required.</li>
            <li>Certificates are issued when a certified course is finished.</li>
          </ul>
        </SettingsCard>

        <SettingsCard title="System" description="Environment status (read-only).">
          <div className="space-y-3">
            <SettingsRow
              label="Data"
              value={
                platform.dataMode === "live"
                  ? "Live database"
                  : "Demo (sample data in memory)"
              }
            />
            <SettingsRow
              label="Invite emails"
              value={platform.emailsEnabled ? "On (Postmark)" : "Off"}
            />
            <SettingsRow
              label="App URL"
              value={
                <span className="break-all font-mono text-xs font-normal">
                  {platform.appUrl}
                </span>
              }
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Video transcription"
          description="API keys and provider for uploaded lesson videos."
          className="lg:col-span-2"
        >
          <TranscriptionSettingsForm />
        </SettingsCard>

        <div className="lg:col-span-2">
          <ThemeToggle />
        </div>

        {platform.dataMode === "demo" ? (
          <SettingsCard
            title="Demo staff login"
            description="Use these when the database is not connected."
            className="lg:col-span-2"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <SettingsRow
                label="Email"
                value={
                  <span className="font-mono text-sm">
                    {platform.demoAdminEmail}
                  </span>
                }
              />
              <SettingsRow label="Password" value="Any password" />
            </div>
          </SettingsCard>
        ) : null}

        <SettingsCard
          title="Shortcuts"
          description="Common admin tasks."
          className="lg:col-span-2"
        >
          <div className="flex flex-wrap gap-2">
            <AdminButtonLink href="/admin/announcements">Announcements</AdminButtonLink>
            <AdminButtonLink href="/admin/external-users">Import users</AdminButtonLink>
            <AdminButtonLink href="/admin/content-health">Fix content</AdminButtonLink>
            <AdminButtonLink href="/admin/analytics">Stats</AdminButtonLink>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config/site";
import { getDemoAdminEmail } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Settings | Admin",
};

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-navy">System settings</h1>

      <div className="space-y-6 max-w-2xl">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Demo mode</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            When Supabase is not configured, the Academy runs in demo mode with
            in-memory data.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Demo admin email</dt>
              <dd className="font-mono text-foreground">{getDemoAdminEmail()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Demo admin password</dt>
              <dd className="text-foreground">Any password (demo only)</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Support</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {SITE_CONFIG.supportEmail}
          </p>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">
            Watch completion threshold
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Default: 90% of lesson duration marks a lesson complete.
          </p>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Award } from "lucide-react";
import { getUserCertificates } from "@/actions/certificates";
import { AppShell } from "@/components/layout/app-shell";
import {
  LearnerPage,
  LearnerPageContent,
  LearnerPageHeader,
} from "@/components/layout/learner-page";
import { EmptyState } from "@/components/ui/empty-state";
import { getCourseById } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Certificates | Maxpro Academy",
};

export default async function CertificatesPage() {
  const certificates = await getUserCertificates();

  const items = certificates.map((cert) => {
    const course = getCourseById(cert.course_id);
    return { cert, course };
  });

  return (
    <AppShell>
      <LearnerPage>
        <LearnerPageContent>
          <LearnerPageHeader
            title="My certificates"
            description="View and download certificates you have earned."
          />

          {items.length === 0 ? (
            <EmptyState
              title="No certificates yet"
              description="Complete certified courses to earn verifiable certificates."
              icon={<Award className="size-10" />}
              action={
                <Link
                  href="/courses"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Browse courses
                </Link>
              }
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(({ cert, course }) => (
                <li key={cert.id}>
                  <Link
                    href={`/certificates/${cert.id}`}
                    className="block h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-border-strong hover:bg-surface focus-ring sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-navy text-navy-foreground">
                        <Award className="size-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-semibold text-foreground">
                          {course?.title ?? "Course certificate"}
                        </h2>
                        <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                          {cert.certificate_number}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Issued{" "}
                          {new Date(cert.issued_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </LearnerPageContent>
      </LearnerPage>
    </AppShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Award } from "lucide-react";
import { getUserCertificates } from "@/actions/certificates";
import { AppShell } from "@/components/layout/app-shell";
import { Container } from "@/components/ui/container";
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
      <Container className="py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-navy">My certificates</h1>
          <p className="mt-2 text-muted-foreground">
            View and download certificates you have earned.
          </p>
        </div>

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
          <ul className="grid gap-4 sm:grid-cols-2">
            {items.map(({ cert, course }) => (
              <li key={cert.id}>
                <Link
                  href={`/certificates/${cert.id}`}
                  className="block rounded-lg border border-border bg-card p-6 transition-colors hover:border-border-strong hover:bg-surface"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-md bg-navy text-navy-foreground">
                      <Award className="size-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {course?.title ?? "Course certificate"}
                      </h2>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
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
      </Container>
    </AppShell>
  );
}

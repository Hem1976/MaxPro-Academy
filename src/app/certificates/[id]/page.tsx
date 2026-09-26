import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CertificateView } from "@/components/certificates/certificate-view";
import { DownloadCertificateButton } from "@/components/certificates/download-certificate-button";
import { Container } from "@/components/ui/container";
import { getCurrentUser } from "@/lib/auth/get-user";
import { resolveCertificateById } from "@/lib/certificates/resolve";
import {
  getDemoCertificateByToken,
  isSupabaseConfigured,
} from "@/lib/data/demo-store";

interface CertificatePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CertificatePageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Certificate ${id.slice(0, 8)}… | Maxpro Academy` };
}

export default async function CertificateDetailPage({
  params,
}: CertificatePageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  let resolved = await resolveCertificateById(id, user.id);

  if (!resolved && !isSupabaseConfigured()) {
    const byToken = getDemoCertificateByToken(id);
    if (byToken && byToken.user_id === user.id) {
      resolved = await resolveCertificateById(byToken.id, user.id);
    }
  }

  if (!resolved) {
    notFound();
  }

  const recipientName =
    resolved.profile.full_name?.trim() ||
    resolved.profile.email.split("@")[0];

  return (
    <AppShell>
      <Container className="max-w-[1100px] py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/certificates"
              className="text-sm text-accent hover:underline"
            >
              ← All certificates
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-navy">
              Your certificate
            </h1>
          </div>
          <DownloadCertificateButton
            certificateId={resolved.certificate.id}
            certificateNumber={resolved.certificate.certificate_number}
          />
        </div>

        <CertificateView
          recipientName={recipientName}
          courseTitle={resolved.course.title}
          productName={resolved.course.product?.name}
          issuedAt={resolved.certificate.issued_at}
          certificateNumber={resolved.certificate.certificate_number}
          verificationToken={resolved.certificate.verification_token}
        />
      </Container>
    </AppShell>
  );
}

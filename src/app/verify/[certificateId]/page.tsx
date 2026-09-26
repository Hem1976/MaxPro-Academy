import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { CertificateView } from "@/components/certificates/certificate-view";
import { BrandedLayout } from "@/components/layout/branded-layout";
import { Container } from "@/components/ui/container";
import { resolveCertificateByToken } from "@/lib/certificates/resolve";

interface VerifyPageProps {
  params: Promise<{ certificateId: string }>;
}

export const metadata: Metadata = {
  title: "Verify Certificate | Maxpro Academy",
  description: "Verify a Maxpro Academy certificate of completion.",
};

export default async function VerifyCertificateByIdPage({
  params,
}: VerifyPageProps) {
  const { certificateId } = await params;
  const decoded = decodeURIComponent(certificateId);
  const resolved = await resolveCertificateByToken(decoded);

  return (
    <BrandedLayout>
      <Container className="max-w-[1100px] py-12">
        {resolved ? (
          <>
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-4 text-success">
              <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Certificate verified</p>
                <p className="text-sm text-success/90">
                  This is a valid Maxpro Academy certificate.
                </p>
              </div>
            </div>
            <CertificateView
              recipientName={
                resolved.profile.full_name?.trim() ||
                resolved.profile.email.split("@")[0]
              }
              courseTitle={resolved.course.title}
              productName={resolved.course.product?.name}
              issuedAt={resolved.certificate.issued_at}
              certificateNumber={resolved.certificate.certificate_number}
              verificationToken={resolved.certificate.verification_token}
            />
          </>
        ) : (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-8 text-center">
            <XCircle
              className="mx-auto size-12 text-destructive"
              aria-hidden="true"
            />
            <h1 className="mt-4 text-xl font-semibold text-foreground">
              Certificate not found
            </h1>
            <p className="mt-2 text-muted-foreground">
              We could not verify a certificate with ID{" "}
              <span className="font-mono text-foreground">{decoded}</span>.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
            >
              Return to Maxpro Academy
            </Link>
          </div>
        )}
      </Container>
    </BrandedLayout>
  );
}

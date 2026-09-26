import { NextResponse } from "next/server";
import {
  buildCertificatePayload,
  generateCertificatePdf,
} from "@/lib/certificates/generate";
import { getCurrentUser } from "@/lib/auth/get-user";
import {
  findDemoCertificate,
  getCourseById,
  getDemoCertificates,
  getDemoUserById,
  isSupabaseConfigured,
} from "@/lib/data/demo-store";
import { createClient } from "@/lib/supabase/server";
import type { Certificate } from "@/types/database";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function resolveDemoCertificate(
  id: string,
  userId: string,
): Certificate | null {
  const direct = findDemoCertificate(id);
  if (direct && direct.user_id === userId) {
    return direct;
  }

  const owned = getDemoCertificates(userId);
  return (
    owned.find((item) => item.id === id) ??
    owned.find(
      (item) =>
        item.certificate_number === id ||
        item.verification_token === id,
    ) ??
    (owned.length === 1 ? owned[0] : null)
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    if (!isSupabaseConfigured()) {
      const certificate = resolveDemoCertificate(id, user.id);
      if (!certificate) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const course = getCourseById(certificate.course_id);
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      const profile = getDemoUserById(certificate.user_id);
      const payload = buildCertificatePayload({
        certificateNumber: certificate.certificate_number,
        verificationToken: certificate.verification_token,
        issuedAt: certificate.issued_at,
        profile: {
          full_name: profile?.full_name ?? user.profile.full_name,
          email: profile?.email ?? user.email,
        },
        course: {
          title: course.title,
          slug: course.slug,
          product: course.product ?? undefined,
        },
      });

      const { pdfBytes } = generateCertificatePdf(payload);

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="maxpro-certificate-${certificate.certificate_number}.pdf"`,
        },
      });
    }

    const supabase = await createClient();
    const { data: certificate } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!certificate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: course } = await supabase
      .from("courses")
      .select("title, slug, products(name)")
      .eq("id", certificate.course_id)
      .maybeSingle();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const product = course.products as unknown as { name: string } | null;
    const payload = buildCertificatePayload({
      certificateNumber: certificate.certificate_number,
      verificationToken: certificate.verification_token,
      issuedAt: certificate.issued_at,
      profile: user.profile,
      course: {
        title: course.title,
        slug: course.slug,
        product: product ? { name: product.name } : undefined,
      },
    });

    const { pdfBytes } = generateCertificatePdf(payload);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="maxpro-certificate-${certificate.certificate_number}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate certificate PDF",
      },
      { status: 500 },
    );
  }
}

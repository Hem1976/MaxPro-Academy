import {
  getCourseById,
  getDemoCertificateById,
  getDemoCertificateByToken,
  getDemoUserById,
  isSupabaseConfigured,
} from "@/lib/data/demo-store";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Course, Profile } from "@/types/database";

export interface ResolvedCertificate {
  certificate: Certificate;
  course: Course;
  profile: Pick<Profile, "full_name" | "email">;
}

export async function resolveCertificateById(
  id: string,
  userId?: string,
): Promise<ResolvedCertificate | null> {
  if (!isSupabaseConfigured()) {
    const certificate = getDemoCertificateById(id);
    if (!certificate) return null;
    if (userId && certificate.user_id !== userId) return null;

    const course = getCourseById(certificate.course_id);
    const user = getDemoUserById(certificate.user_id);
    if (!course || !user) return null;

    return {
      certificate,
      course,
      profile: { full_name: user.full_name, email: user.email },
    };
  }

  const supabase = await createClient();
  let query = supabase.from("certificates").select("*").eq("id", id);
  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data: certificate } = await query.maybeSingle();
  if (!certificate) return null;

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", certificate.course_id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", certificate.user_id)
    .maybeSingle();

  if (!course || !profile) return null;

  return {
    certificate: certificate as Certificate,
    course: course as Course,
    profile: profile as Pick<Profile, "full_name" | "email">,
  };
}

export async function resolveCertificateByToken(
  token: string,
): Promise<ResolvedCertificate | null> {
  const normalized = token.trim();

  if (!isSupabaseConfigured()) {
    const certificate = getDemoCertificateByToken(normalized);
    if (!certificate) return null;

    const course = getCourseById(certificate.course_id);
    const user = getDemoUserById(certificate.user_id);
    if (!course || !user) return null;

    return {
      certificate,
      course,
      profile: { full_name: user.full_name, email: user.email },
    };
  }

  const supabase = await createClient();
  const { data: byToken } = await supabase
    .from("certificates")
    .select("*")
    .eq("verification_token", normalized)
    .maybeSingle();

  let certificate = byToken;

  if (!certificate) {
    const { data: byNumber } = await supabase
      .from("certificates")
      .select("*")
      .eq("certificate_number", normalized)
      .maybeSingle();
    certificate = byNumber;
  }

  if (!certificate) return null;

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", certificate.course_id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", certificate.user_id)
    .maybeSingle();

  if (!course || !profile) return null;

  return {
    certificate: certificate as Certificate,
    course: course as Course,
    profile: profile as Pick<Profile, "full_name" | "email">,
  };
}

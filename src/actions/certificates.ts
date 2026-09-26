"use server";

import { generateVerificationToken } from "@/lib/certificates/generate";
import { requireCurrentUser } from "@/lib/auth/get-user";
import { actionError, actionSuccess, type ActionResult } from "@/lib/auth/action-result";
import {
  getCourseById,
  getDemoCertificate,
  getDemoCertificates,
  isSupabaseConfigured,
  issueDemoCertificate,
  nextDemoCertificateSequence,
} from "@/lib/data/demo-store";
import { createClient } from "@/lib/supabase/server";
import type { Certificate } from "@/types/database";

function generateAcademyCertificateNumber(sequence: number): string {
  const padded = String(Math.max(1, sequence)).padStart(6, "0");
  return `MAXPRO-ACADEMY-${padded}`;
}

export async function issueCertificate(
  userId: string,
  courseId: string,
): Promise<ActionResult<Certificate>> {
  const course = getCourseById(courseId);
  if (!course) {
    return actionError("Course not found");
  }

  if (!course.certificate_enabled) {
    return actionError("Certificates are not enabled for this course");
  }

  if (!isSupabaseConfigured()) {
    const existing = getDemoCertificate(userId, courseId);
    if (existing) {
      return actionSuccess(existing);
    }

    const certificate = issueDemoCertificate({
      userId,
      courseId,
      certificateNumber: generateAcademyCertificateNumber(
        nextDemoCertificateSequence(),
      ),
      verificationToken: generateVerificationToken(),
    });

    return actionSuccess(certificate);
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    return actionSuccess(existing as Certificate);
  }

  const { count } = await supabase
    .from("certificates")
    .select("id", { count: "exact", head: true });

  const certificateNumber = generateAcademyCertificateNumber((count ?? 0) + 1);
  const verificationToken = generateVerificationToken();

  const { data, error } = await supabase
    .from("certificates")
    .insert({
      user_id: userId,
      course_id: courseId,
      certificate_number: certificateNumber,
      verification_token: verificationToken,
      issued_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to issue certificate");
  }

  return actionSuccess(data as Certificate);
}

export async function issueCertificateForCurrentUser(
  courseId: string,
): Promise<ActionResult<Certificate>> {
  const user = await requireCurrentUser();
  return issueCertificate(user.id, courseId);
}

export async function getUserCertificates(): Promise<Certificate[]> {
  const user = await requireCurrentUser();

  if (!isSupabaseConfigured()) {
    return getDemoCertificates(user.id);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false });

  return (data ?? []) as Certificate[];
}

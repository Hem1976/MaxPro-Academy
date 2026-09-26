import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CompletionScreen } from "@/components/lesson/completion-screen";
import { getCurrentUser } from "@/lib/auth/get-user";
import {
  getCourseBySlug,
  getCourseProgress,
  getDemoCertificate,
} from "@/lib/data/demo-store";

interface CompletePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CompletePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    return { title: "Course not found" };
  }

  return {
    title: `${course.title} — Complete`,
    description: `You completed ${course.title} on Maxpro Academy.`,
  };
}

export default async function CourseCompletePage({ params }: CompletePageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/courses/${slug}/complete`)}`,
    );
  }

  const course = getCourseBySlug(slug);

  if (!course || !course.published) {
    notFound();
  }

  const progress = getCourseProgress(user.id, course.id);
  const certificate = getDemoCertificate(user.id, course.id);

  if (
    progress.percent < 100 &&
    progress.enrollment?.status !== "completed" &&
    !certificate
  ) {
    redirect(`/courses/${slug}`);
  }
  const recipientName =
    user.profile.full_name?.trim() || user.email.split("@")[0];

  return (
    <AppShell>
      <CompletionScreen
        courseTitle={course.title}
        courseSlug={slug}
        recipientName={recipientName}
        certificateEnabled={course.certificate_enabled}
        hasCertificate={
          Boolean(certificate) || progress.enrollment?.status === "completed"
        }
      />
    </AppShell>
  );
}

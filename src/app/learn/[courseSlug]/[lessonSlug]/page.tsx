import { redirect } from "next/navigation";

interface LearnRedirectPageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}

export default async function LearnRedirectPage({
  params,
}: LearnRedirectPageProps) {
  const { courseSlug, lessonSlug } = await params;
  redirect(`/courses/${courseSlug}/lesson/${lessonSlug}`);
}

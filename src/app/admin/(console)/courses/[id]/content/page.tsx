import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** @deprecated Use the unified course builder at /admin/courses/[id] */
export default async function CourseContentRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/admin/courses/${id}`);
}

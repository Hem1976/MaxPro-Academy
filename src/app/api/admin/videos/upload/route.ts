import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";
import {
  sanitizeVideoFileName,
  saveCourseVideoFile,
  titleFromFileName,
} from "@/lib/admin/video-storage";
import { getCourseById } from "@/lib/data/demo-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user.profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const file = formData.get("file");

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const course = getCourseById(courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  try {
    const originalName = file.name || "video.mp4";
    const fileName = sanitizeVideoFileName(originalName);
    const bytes = Buffer.from(await file.arrayBuffer());
    const saved = await saveCourseVideoFile({
      courseSlug: course.slug,
      fileName,
      bytes,
    });

    return NextResponse.json({
      publicUrl: saved.publicUrl,
      fileName: saved.fileName,
      suggestedTitle: titleFromFileName(originalName),
      suggestedSlug: fileName.replace(/\.[^.]+$/, "").toLowerCase(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save video";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

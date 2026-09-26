import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { slugify } from "@/lib/utils";

const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
  ".ogg",
]);

export function sanitizeVideoFileName(originalName: string): string {
  const base = originalName.replace(/\\/g, "/").split("/").pop() ?? "video.mp4";
  const dot = base.lastIndexOf(".");
  const ext = dot >= 0 ? base.slice(dot).toLowerCase() : ".mp4";
  const stem = dot >= 0 ? base.slice(0, dot) : base;
  const safeStem = slugify(stem) || "video";
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".mp4";
  return `${safeStem}${safeExt}`;
}

export function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function publicCourseVideoUrl(courseSlug: string, fileName: string): string {
  const courseSegment = encodeURIComponent(courseSlug);
  const fileSegment = encodeURIComponent(fileName);
  return `/Videos/Courses/${courseSegment}/${fileSegment}`;
}

export function courseVideosDirectory(courseSlug: string): string {
  return join(process.cwd(), "public", "Videos", "Courses", courseSlug);
}

export async function saveCourseVideoFile(input: {
  courseSlug: string;
  fileName: string;
  bytes: Buffer;
}): Promise<{ publicUrl: string; fileName: string }> {
  if (input.bytes.byteLength > MAX_VIDEO_BYTES) {
    throw new Error("Video file is too large (max 500 MB)");
  }

  const ext = input.fileName.slice(input.fileName.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("Unsupported video format. Use MP4, WebM, MOV, or M4V.");
  }

  const dir = courseVideosDirectory(input.courseSlug);
  await mkdir(dir, { recursive: true });
  const diskPath = join(dir, input.fileName);
  await writeFile(diskPath, input.bytes);

  return {
    fileName: input.fileName,
    publicUrl: publicCourseVideoUrl(input.courseSlug, input.fileName),
  };
}

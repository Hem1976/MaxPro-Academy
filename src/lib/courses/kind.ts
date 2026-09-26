import type { Course, CourseKind } from "@/types/database";

export type { CourseKind };

export const COURSE_KIND_LABELS: Record<CourseKind, string> = {
  internal: "Internal",
  external: "External",
};

export function getCourseKind(course: Pick<Course, "course_kind">): CourseKind {
  return course.course_kind ?? "internal";
}

export function isExternalCourse(course: Pick<Course, "course_kind">): boolean {
  return getCourseKind(course) === "external";
}

export function isInternalCourse(course: Pick<Course, "course_kind">): boolean {
  return getCourseKind(course) === "internal";
}

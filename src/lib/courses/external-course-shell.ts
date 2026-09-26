import {
  createDemoLesson,
  createDemoModule,
  getCourseWithModules,
  isSupabaseConfigured,
} from "@/lib/data/demo-store";
import { createClient } from "@/lib/supabase/server";
import type { Lesson, Module } from "@/types/database";

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** One module + questionnaire lesson for external (quiz-only) courses. */
export async function ensureExternalCourseShell(
  courseId: string,
  courseTitle: string,
): Promise<{ moduleId: string; lessonId: string }> {
  const detail = getCourseWithModules(courseId);
  const existingModule = detail?.modules[0];
  if (existingModule) {
    const lesson =
      existingModule.lessons.find((item) => item.slug === "questionnaire") ??
      existingModule.lessons[0];
    if (lesson) {
      return { moduleId: existingModule.id, lessonId: lesson.id };
    }
  }

  const now = new Date().toISOString();
  const module: Module = {
    id: generateId(),
    course_id: courseId,
    title: "Questionnaire",
    description: `Assessment for ${courseTitle}`,
    sort_order: 1,
    created_at: now,
    updated_at: now,
  };

  const lesson: Lesson = {
    id: generateId(),
    module_id: module.id,
    title: "Questionnaire",
    slug: "questionnaire",
    description: "Complete the uploaded questionnaire to finish this course.",
    learning_objective: "Demonstrate understanding of the external training material.",
    video_provider: "placeholder",
    video_id: null,
    video_url: null,
    duration_seconds: 0,
    thumbnail_url: null,
    transcript: null,
    written_content:
      "## External course\n\nThis course is completed by passing the questionnaire. Review any materials provided by your organization, then take the quiz.",
    captions_url: null,
    processing_status: "ready",
    published: true,
    required: true,
    sort_order: 1,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured()) {
    createDemoModule(module);
    createDemoLesson(lesson);
    return { moduleId: module.id, lessonId: lesson.id };
  }

  const supabase = await createClient();
  const { error: moduleError } = await supabase.from("modules").insert(module);
  if (moduleError) {
    throw new Error(moduleError.message);
  }

  const { error: lessonError } = await supabase.from("lessons").insert({
    id: lesson.id,
    module_id: lesson.module_id,
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    learning_objective: lesson.learning_objective,
    video_provider: lesson.video_provider,
    video_id: lesson.video_id,
    video_url: lesson.video_url,
    duration_seconds: lesson.duration_seconds,
    thumbnail_url: lesson.thumbnail_url,
    transcript: lesson.transcript,
    written_content: lesson.written_content,
    captions_url: lesson.captions_url,
    processing_status: lesson.processing_status,
    published: lesson.published,
    required: lesson.required,
    sort_order: lesson.sort_order,
    version: lesson.version,
    last_reviewed_at: lesson.last_reviewed_at,
    review_status: lesson.review_status,
    created_at: lesson.created_at,
    updated_at: lesson.updated_at,
  });

  if (lessonError) {
    throw new Error(lessonError.message);
  }

  return { moduleId: module.id, lessonId: lesson.id };
}

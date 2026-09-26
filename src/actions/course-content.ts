"use server";

import { createQuizWithQuestions } from "@/actions/admin";
import { actionError, actionSuccess, type ActionResult } from "@/lib/auth/action-result";
import { requireCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";
import {
  generateCourseQuizDraft,
  type GeneratedCourseQuiz,
} from "@/lib/ai/quiz-generator";
import {
  createDemoLesson,
  createDemoModule,
  deleteDemoQuizzesForCourse,
  getCourseById,
  getCourseQuizWithQuestions,
  getCourseWithModules,
  getOrderedLessonsForCourse,
  isSupabaseConfigured,
} from "@/lib/data/demo-store";
import { ensureExternalCourseShell } from "@/lib/courses/external-course-shell";
import { isExternalCourse } from "@/lib/courses/kind";
import {
  parseQuestionnaireJson,
  type QuestionnaireUpload,
} from "@/lib/validations/questionnaire";
import { slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { Lesson, Module, Quiz } from "@/types/database";
import { z } from "zod";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (!canAccessAdmin(user.profile.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const videoLessonInputSchema = z.object({
  moduleId: z.string().trim().optional(),
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(120),
  videoUrl: z.string().trim().min(1),
  durationSeconds: z.number().int().min(0).max(86400).optional(),
  published: z.boolean().optional(),
});

const createVideoLessonsSchema = z.object({
  courseId: z.string().trim().min(1),
  lessons: z.array(videoLessonInputSchema).min(1).max(50),
  newModule: z
    .object({
      title: z.string().trim().min(2).max(200),
      description: z.string().trim().max(500).optional(),
    })
    .optional(),
});

export async function createVideoLessons(
  input: z.infer<typeof createVideoLessonsSchema>,
): Promise<ActionResult<{ lessons: Lesson[]; module?: Module }>> {
  await requireAdmin();

  const parsed = createVideoLessonsSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const course = getCourseById(parsed.data.courseId);
  if (!course) {
    return actionError("Course not found");
  }

  let createdModule: Module | undefined;
  const detail = getCourseWithModules(course.id);
  if (!detail) {
    return actionError("Course not found");
  }

  const moduleIds = new Set(detail.modules.map((item) => item.id));
  let targetModuleId = parsed.data.lessons[0]?.moduleId;

  if (parsed.data.newModule) {
    const now = new Date().toISOString();
    const sortOrder =
      detail.modules.reduce((max, item) => Math.max(max, item.sort_order), 0) + 1;
    const module: Module = {
      id: generateId(),
      course_id: course.id,
      title: parsed.data.newModule.title,
      description: parsed.data.newModule.description ?? null,
      sort_order: sortOrder,
      created_at: now,
      updated_at: now,
    };

    if (!isSupabaseConfigured()) {
      createdModule = createDemoModule(module);
    } else {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("modules")
        .insert(module)
        .select("*")
        .single();
      if (error || !data) {
        return actionError(error?.message ?? "Unable to create module");
      }
      createdModule = data as Module;
    }

    targetModuleId = createdModule.id;
    moduleIds.add(createdModule.id);
  }

  if (!createdModule) {
    for (const lesson of parsed.data.lessons) {
      const moduleId = lesson.moduleId?.trim();
      if (!moduleId || !moduleIds.has(moduleId)) {
        return actionError("One or more lessons reference an unknown module");
      }
    }
  }

  const createdLessons: Lesson[] = [];
  const now = new Date().toISOString();

  for (const item of parsed.data.lessons) {
    const moduleId = createdModule
      ? createdModule.id
      : (item.moduleId?.trim() ?? "");
    const moduleLessons = detail.modules
      .flatMap((mod) => mod.lessons)
      .filter((lesson) => lesson.module_id === moduleId);
    const nextSort =
      moduleLessons.reduce((max, lesson) => Math.max(max, lesson.sort_order), 0) +
      1 +
      createdLessons.filter((lesson) => lesson.module_id === moduleId).length;

    const lesson: Lesson = {
      id: generateId(),
      module_id: moduleId,
      title: item.title,
      slug: slugify(item.slug) || slugify(item.title),
      description: null,
      learning_objective: `Apply the concepts shown in ${item.title}.`,
      video_provider: "external",
      video_id: null,
      video_url: item.videoUrl,
      duration_seconds: item.durationSeconds ?? 600,
      thumbnail_url: null,
      transcript: null,
      written_content: null,
      captions_url: null,
      processing_status: "ready",
      published: item.published ?? true,
      required: true,
      sort_order: nextSort,
      version: "1.0",
      last_reviewed_at: null,
      review_status: "current",
      created_at: now,
      updated_at: now,
    };

    if (!isSupabaseConfigured()) {
      createdLessons.push(createDemoLesson(lesson));
    } else {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("lessons")
        .insert({
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
        })
        .select("*")
        .single();

      if (error || !data) {
        return actionError(error?.message ?? "Unable to create lesson");
      }
      createdLessons.push(data as Lesson);
    }
  }

  return actionSuccess({ lessons: createdLessons, module: createdModule });
}

export async function generateCourseQuizWithAi(input: {
  courseId: string;
  questionCount?: number;
}): Promise<
  ActionResult<{
    draft: GeneratedCourseQuiz;
    provider: string;
    model: string;
    warning?: string;
  }>
> {
  await requireAdmin();

  const course = getCourseById(input.courseId);
  if (!course) {
    return actionError("Course not found");
  }

  const lessons = getOrderedLessonsForCourse(course.id);
  const result = await generateCourseQuizDraft({
    courseTitle: course.title,
    courseDescription: course.description,
    lessons,
    questionCount: input.questionCount ?? Math.min(10, Math.max(3, lessons.length)),
  });

  return actionSuccess({
    draft: result.quiz,
    provider: result.provider,
    model: result.model,
    warning: result.warning,
  });
}

function resolveCourseQuizLessonId(courseId: string): string | null {
  const lessons = getOrderedLessonsForCourse(courseId);
  const last = lessons.at(-1);
  return last?.id ?? null;
}

export async function saveCourseQuiz(
  input: {
    courseId: string;
    quiz: GeneratedCourseQuiz;
  },
): Promise<ActionResult<Quiz>> {
  await requireAdmin();

  const course = getCourseById(input.courseId);
  if (course && isExternalCourse(course)) {
    try {
      await ensureExternalCourseShell(course.id, course.title);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to prepare course";
      return actionError(message);
    }
  }

  const existing = getCourseQuizWithQuestions(input.courseId);
  if (existing) {
    return actionError(
      "This course already has a quiz. Remove it from the database or use the Quizzes admin list before adding another.",
    );
  }

  const lessonId = resolveCourseQuizLessonId(input.courseId);
  if (!lessonId) {
    return actionError(
      "Add at least one lesson before saving a course quiz (the quiz attaches to the final lesson).",
    );
  }

  return createQuizWithQuestions({
    lessonId,
    title: input.quiz.title,
    description: input.quiz.description,
    passingScore: input.quiz.passingScore,
    required: true,
    questions: input.quiz.questions.map((question) => ({
      question: question.question,
      explanation: question.explanation,
      options: question.options.map((option) => ({
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    })),
  });
}

export async function importExternalQuestionnaire(input: {
  courseId: string;
  questionnaireJson: string;
  replaceExisting?: boolean;
}): Promise<ActionResult<Quiz>> {
  await requireAdmin();

  const course = getCourseById(input.courseId);
  if (!course) {
    return actionError("Course not found");
  }

  if (!isExternalCourse(course)) {
    return actionError(
      "Questionnaire upload is only available for external courses. Change course type to External on the course edit page.",
    );
  }

  let questionnaire: QuestionnaireUpload;
  try {
    questionnaire = parseQuestionnaireJson(input.questionnaireJson);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid questionnaire file";
    return actionError(message);
  }

  const existing = getCourseQuizWithQuestions(course.id);
  if (existing && !input.replaceExisting) {
    return actionError(
      "This course already has a questionnaire. Upload again with replace enabled to overwrite it.",
    );
  }

  if (existing && input.replaceExisting) {
    if (!isSupabaseConfigured()) {
      deleteDemoQuizzesForCourse(course.id);
    } else {
      return actionError(
        "Replacing questionnaires on Supabase is not supported yet. Remove the quiz in the database first.",
      );
    }
  }

  try {
    const { lessonId } = await ensureExternalCourseShell(course.id, course.title);
    return createQuizWithQuestions({
      lessonId,
      title: questionnaire.title,
      description: questionnaire.description,
      passingScore: questionnaire.passingScore,
      required: true,
      questions: questionnaire.questions.map((question) => ({
        question: question.question,
        explanation: question.explanation,
        options: question.options.map((option) => ({
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to import questionnaire";
    return actionError(message);
  }
}

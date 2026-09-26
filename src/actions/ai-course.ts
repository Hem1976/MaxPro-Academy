"use server";

import { requireCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";
import { actionError, actionSuccess, type ActionResult } from "@/lib/auth/action-result";
import { generateCourseDraft } from "@/lib/ai/course-generator";
import {
  GENERAL_TRAINING_PRODUCT_ID,
  aiCourseGenerateInputSchema,
  generatedCourseDraftSchema,
  type GeneratedCourseDraft,
} from "@/lib/ai/course-schema";
import { getLocalAiStatus, type LocalAiStatus } from "@/lib/ai/ollama";
import {
  createDemoCourse,
  createDemoLesson,
  createDemoModule,
  createDemoQuizWithQuestions,
  getProductById,
  isSupabaseConfigured,
} from "@/lib/data/demo-store";
import { createClient } from "@/lib/supabase/server";
import { toYoutubeEmbedUrl } from "@/lib/video/provider";
import { slugify } from "@/lib/utils";
import type {
  Course,
  Lesson,
  Module,
  Quiz,
  QuizOption,
  QuizQuestion,
} from "@/types/database";

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

export async function getAiCourseBuilderStatus(): Promise<
  ActionResult<LocalAiStatus>
> {
  await requireAdmin();
  return actionSuccess(await getLocalAiStatus());
}

export async function generateAiCourseDraft(input: unknown): Promise<
  ActionResult<{
    draft: GeneratedCourseDraft;
    provider: "ollama" | "fallback";
    model: string;
    warning?: string;
    productId: string;
    youtubeVideoCount?: number;
    youtubePlaylistTitle?: string | null;
  }>
> {
  await requireAdmin();

  const parsed = aiCourseGenerateInputSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const resolvedProductId =
    parsed.data.productId && parsed.data.productId.length > 0
      ? parsed.data.productId
      : GENERAL_TRAINING_PRODUCT_ID;

  const product = getProductById(resolvedProductId);
  if (!product) {
    return actionError("Product not found");
  }

  const result = await generateCourseDraft({
    request: {
      ...parsed.data,
      productId: resolvedProductId,
    },
    productName: product.name,
    productDescription: product.description ?? product.short_description,
  });

  return actionSuccess({
    ...result,
    productId: resolvedProductId,
    youtubeVideoCount: result.youtube?.videos.length ?? 0,
    youtubePlaylistTitle: result.youtube?.title ?? null,
  });
}

export async function publishAiCourseDraft(input: {
  productId?: string | null;
  draft: GeneratedCourseDraft;
  publishNow?: boolean;
  youtubeUrl?: string | null;
}): Promise<ActionResult<{ courseId: string; courseSlug: string }>> {
  await requireAdmin();

  const draftParsed = generatedCourseDraftSchema.safeParse(input.draft);
  if (!draftParsed.success) {
    return actionError(
      draftParsed.error.issues[0]?.message ?? "Invalid course draft",
    );
  }

  const resolvedProductId =
    input.productId && input.productId.length > 0
      ? input.productId
      : GENERAL_TRAINING_PRODUCT_ID;

  const product = getProductById(resolvedProductId);
  if (!product) {
    return actionError("Product not found");
  }

  const draft = draftParsed.data;
  const now = new Date().toISOString();
  const publishNow = Boolean(input.publishNow);
  const courseId = generateId();
  const courseSlug = slugify(draft.slug || draft.title);

  const course: Course = {
    id: courseId,
    product_id: resolvedProductId,
    title: draft.title,
    slug: courseSlug,
    description: draft.description,
    short_description: draft.shortDescription,
    thumbnail_url: product.cover_image_url,
    level: draft.level,
    estimated_minutes: draft.estimatedMinutes,
    published: publishNow,
    featured: false,
    certificate_enabled: true,
    sort_order: 50,
    learning_outcomes: draft.learningOutcomes,
    status: publishNow ? "published" : "draft",
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: now,
    updated_at: now,
  };

  let finalLessonId: string | null = null;

  if (!isSupabaseConfigured()) {
    createDemoCourse(course);

    for (const [moduleIndex, courseModule] of draft.modules.entries()) {
      const moduleId = generateId();
      const moduleRecord: Module = {
        id: moduleId,
        course_id: courseId,
        title: courseModule.title,
        description: courseModule.description,
        sort_order: moduleIndex + 1,
        created_at: now,
        updated_at: now,
      };
      createDemoModule(moduleRecord);

      for (const [lessonIndex, lesson] of courseModule.lessons.entries()) {
        const lessonId = generateId();
        const videoId =
          lesson.youtubeVideoId && /^[\w-]{11}$/.test(lesson.youtubeVideoId)
            ? lesson.youtubeVideoId
            : null;
        const embed = videoId ? toYoutubeEmbedUrl(videoId) : null;

        const lessonRecord: Lesson = {
          id: lessonId,
          module_id: moduleId,
          title: lesson.title,
          slug: slugify(lesson.slug || lesson.title),
          description: lesson.description,
          learning_objective: lesson.learningObjective,
          video_provider: videoId ? "youtube" : "placeholder",
          video_id: videoId,
          video_url: embed,
          duration_seconds: lesson.estimatedMinutes * 60,
          thumbnail_url: product.cover_image_url,
          transcript: null,
          written_content: lesson.writtenContent,
          captions_url: null,
          processing_status: "ready",
          published: publishNow,
          required: true,
          sort_order: lessonIndex + 1,
          version: "1.0",
          last_reviewed_at: null,
          review_status: "current",
          created_at: now,
          updated_at: now,
        };
        createDemoLesson(lessonRecord);
        finalLessonId = lessonId;
      }
    }

    if (!finalLessonId) {
      return actionError("Draft has no lessons to attach a quiz to");
    }

    const quizId = generateId();
    const quiz: Quiz = {
      id: quizId,
      lesson_id: finalLessonId,
      title: draft.quiz.title,
      description: draft.quiz.description,
      passing_score: draft.quiz.passingScore,
      required: true,
      created_at: now,
      updated_at: now,
    };

    const questions = draft.quiz.questions.map((question, qIndex) => {
      const questionId = generateId();
      const questionRecord: QuizQuestion = {
        id: questionId,
        quiz_id: quizId,
        question: question.question,
        explanation: question.explanation,
        sort_order: qIndex + 1,
        created_at: now,
      };

      const options: QuizOption[] = question.options.map((option, oIndex) => ({
        id: generateId(),
        question_id: questionId,
        option_text: option.text,
        is_correct: option.isCorrect,
        sort_order: oIndex + 1,
      }));

      return { question: questionRecord, options };
    });

    createDemoQuizWithQuestions({ quiz, questions });

    return actionSuccess({ courseId, courseSlug });
  }

  const supabase = await createClient();
  const { error: courseError } = await supabase.from("courses").insert({
    id: course.id,
    product_id: course.product_id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    short_description: course.short_description,
    thumbnail_url: course.thumbnail_url,
    level: course.level,
    estimated_minutes: course.estimated_minutes,
    published: course.published,
    featured: course.featured,
    certificate_enabled: course.certificate_enabled,
    sort_order: course.sort_order,
    learning_outcomes: course.learning_outcomes,
    status: course.status,
    version: course.version,
  });

  if (courseError) {
    return actionError(courseError.message);
  }

  for (const [moduleIndex, courseModule] of draft.modules.entries()) {
    const moduleId = generateId();
    const { error: moduleError } = await supabase.from("modules").insert({
      id: moduleId,
      course_id: courseId,
      title: courseModule.title,
      description: courseModule.description,
      sort_order: moduleIndex + 1,
    });

    if (moduleError) {
      return actionError(moduleError.message);
    }

    for (const [lessonIndex, lesson] of courseModule.lessons.entries()) {
      const lessonId = generateId();
      const videoId =
        lesson.youtubeVideoId && /^[\w-]{11}$/.test(lesson.youtubeVideoId)
          ? lesson.youtubeVideoId
          : null;
      const embed = videoId ? toYoutubeEmbedUrl(videoId) : null;

      const { error: lessonError } = await supabase.from("lessons").insert({
        id: lessonId,
        module_id: moduleId,
        title: lesson.title,
        slug: slugify(lesson.slug || lesson.title),
        description: lesson.description,
        learning_objective: lesson.learningObjective,
        video_provider: videoId ? "youtube" : "placeholder",
        video_id: videoId,
        video_url: embed,
        duration_seconds: lesson.estimatedMinutes * 60,
        thumbnail_url: product.cover_image_url,
        written_content: lesson.writtenContent,
        processing_status: "ready",
        published: publishNow,
        required: true,
        sort_order: lessonIndex + 1,
        version: "1.0",
        review_status: "current",
      });

      if (lessonError) {
        return actionError(lessonError.message);
      }

      finalLessonId = lessonId;
    }
  }

  if (!finalLessonId) {
    return actionError("Draft has no lessons to attach a quiz to");
  }

  const quizId = generateId();
  const { error: quizError } = await supabase.from("quizzes").insert({
    id: quizId,
    lesson_id: finalLessonId,
    title: draft.quiz.title,
    description: draft.quiz.description,
    passing_score: draft.quiz.passingScore,
    required: true,
  });

  if (quizError) {
    return actionError(quizError.message);
  }

  for (const [qIndex, question] of draft.quiz.questions.entries()) {
    const questionId = generateId();
    const { error: questionError } = await supabase
      .from("quiz_questions")
      .insert({
        id: questionId,
        quiz_id: quizId,
        question: question.question,
        explanation: question.explanation,
        sort_order: qIndex + 1,
      });

    if (questionError) {
      return actionError(questionError.message);
    }

    const { error: optionsError } = await supabase.from("quiz_options").insert(
      question.options.map((option, oIndex) => ({
        id: generateId(),
        question_id: questionId,
        option_text: option.text,
        is_correct: option.isCorrect,
        sort_order: oIndex + 1,
      })),
    );

    if (optionsError) {
      return actionError(optionsError.message);
    }
  }

  return actionSuccess({ courseId, courseSlug });
}

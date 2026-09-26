"use server";

import { requireCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";
import { actionError, actionSuccess, type ActionResult } from "@/lib/auth/action-result";
import {
  createDemoAnnouncement,
  createDemoCourse,
  createDemoLesson,
  createDemoModule,
  createDemoProduct,
  createDemoQuizWithQuestions,
  deleteDemoAnnouncement,
  getOrderedLessonsForCourse,
  isSupabaseConfigured,
  updateDemoAnnouncement,
  updateDemoCourse,
  updateDemoLesson,
  updateDemoProduct,
  updateDemoUserRole,
} from "@/lib/data/demo-store";
import { ensureExternalCourseShell } from "@/lib/courses/external-course-shell";
import { createClient } from "@/lib/supabase/server";
import {
  courseCreateSchema,
  courseUpdateSchema,
  lessonCreateSchema,
  lessonUpdateSchema,
  productCreateSchema,
} from "@/lib/validations/schemas";
import type {
  Announcement,
  Course,
  Lesson,
  Module,
  Product,
  Quiz,
  UserRole,
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
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function createProduct(
  formData: FormData,
): Promise<ActionResult<Product>> {
  await requireAdmin();

  const parsed = productCreateSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    category: formData.get("category"),
    published: formData.get("published") === "true",
    featured: formData.get("featured") === "true",
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid product data");
  }

  const now = new Date().toISOString();
  const product: Product = {
    id: generateId(),
    name: parsed.data.name,
    slug: parsed.data.slug,
    short_description: parsed.data.shortDescription ?? null,
    description: parsed.data.description ?? null,
    logo_url: parsed.data.logoUrl ?? null,
    cover_image_url: parsed.data.coverImageUrl ?? null,
    category: parsed.data.category ?? null,
    published: parsed.data.published,
    featured: parsed.data.featured,
    sort_order: parsed.data.sortOrder,
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured()) {
    return actionSuccess(createDemoProduct(product));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      id: product.id,
      name: product.name,
      slug: product.slug,
      short_description: product.short_description,
      description: product.description,
      logo_url: product.logo_url,
      cover_image_url: product.cover_image_url,
      category: product.category,
      published: product.published,
      featured: product.featured,
      sort_order: product.sort_order,
    })
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to create product");
  }

  return actionSuccess(data as Product);
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<ActionResult<Product>> {
  await requireAdmin();

  const updates = {
    name: formData.get("name") || undefined,
    slug: formData.get("slug") || undefined,
    shortDescription: formData.get("shortDescription") || undefined,
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    published:
      formData.has("published")
        ? formData.get("published") === "true"
        : undefined,
    featured:
      formData.has("featured") ? formData.get("featured") === "true" : undefined,
    sortOrder: formData.get("sortOrder") || undefined,
  };

  if (!isSupabaseConfigured()) {
    const updated = updateDemoProduct(id, {
      name: updates.name as string | undefined,
      slug: updates.slug as string | undefined,
      short_description: updates.shortDescription as string | undefined,
      description: updates.description as string | undefined,
      category: updates.category as string | undefined,
      published: updates.published,
      featured: updates.featured,
      sort_order: updates.sortOrder
        ? Number(updates.sortOrder)
        : undefined,
    });

    if (!updated) {
      return actionError("Product not found");
    }

    return actionSuccess(updated);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      name: updates.name,
      slug: updates.slug,
      short_description: updates.shortDescription,
      description: updates.description,
      category: updates.category,
      published: updates.published,
      featured: updates.featured,
      sort_order: updates.sortOrder ? Number(updates.sortOrder) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to update product");
  }

  return actionSuccess(data as Product);
}

export async function createCourse(
  formData: FormData,
): Promise<ActionResult<Course>> {
  await requireAdmin();

  const parsed = courseCreateSchema.safeParse({
    productId: formData.get("productId"),
    courseKind: formData.get("courseKind") ?? "internal",
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    shortDescription: formData.get("shortDescription"),
    level: formData.get("level"),
    estimatedMinutes: formData.get("estimatedMinutes"),
    published: formData.get("published") === "true",
    featured: formData.get("featured") === "true",
    certificateEnabled: formData.get("certificateEnabled") === "true",
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid course data");
  }

  const now = new Date().toISOString();
  const course: Course = {
    id: generateId(),
    product_id: parsed.data.productId,
    course_kind: parsed.data.courseKind,
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    short_description: parsed.data.shortDescription ?? null,
    thumbnail_url: null,
    level: parsed.data.level,
    estimated_minutes: parsed.data.estimatedMinutes,
    published: parsed.data.published,
    featured: parsed.data.featured,
    certificate_enabled: parsed.data.certificateEnabled,
    sort_order: 0,
    learning_outcomes: parsed.data.learningOutcomes ?? null,
    status: parsed.data.status,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured()) {
    const created = createDemoCourse(course);
    if (parsed.data.courseKind === "external") {
      await ensureExternalCourseShell(created.id, created.title);
    }
    return actionSuccess(created);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .insert({
      id: course.id,
      product_id: course.product_id,
      course_kind: course.course_kind,
      title: course.title,
      slug: course.slug,
      description: course.description,
      short_description: course.short_description,
      level: course.level,
      estimated_minutes: course.estimated_minutes,
      published: course.published,
      featured: course.featured,
      certificate_enabled: course.certificate_enabled,
      status: course.status,
    })
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to create course");
  }

  if (parsed.data.courseKind === "external") {
    await ensureExternalCourseShell(data.id, data.title);
  }

  return actionSuccess(data as Course);
}

export async function updateCourse(
  id: string,
  formData: FormData,
): Promise<ActionResult<Course>> {
  await requireAdmin();

  const parsed = courseUpdateSchema.safeParse({
    productId: formData.get("productId") || undefined,
    title: formData.get("title") || undefined,
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    shortDescription: formData.get("shortDescription") || undefined,
    level: formData.get("level") || undefined,
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
    published:
      formData.has("published")
        ? formData.get("published") === "true"
        : undefined,
    featured:
      formData.has("featured") ? formData.get("featured") === "true" : undefined,
    certificateEnabled:
      formData.has("certificateEnabled")
        ? formData.get("certificateEnabled") === "true"
        : undefined,
    status: formData.get("status") || undefined,
    courseKind: formData.get("courseKind") || undefined,
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid course data");
  }

  if (!isSupabaseConfigured()) {
    const updated = updateDemoCourse(id, {
      product_id: parsed.data.productId,
      course_kind: parsed.data.courseKind,
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      short_description: parsed.data.shortDescription,
      level: parsed.data.level,
      estimated_minutes: parsed.data.estimatedMinutes,
      published: parsed.data.published,
      featured: parsed.data.featured,
      certificate_enabled: parsed.data.certificateEnabled,
      status: parsed.data.status,
    });

    if (!updated) {
      return actionError("Course not found");
    }

    if (parsed.data.courseKind === "external") {
      await ensureExternalCourseShell(updated.id, updated.title);
    }

    return actionSuccess(updated);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .update({
      product_id: parsed.data.productId,
      course_kind: parsed.data.courseKind,
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      short_description: parsed.data.shortDescription,
      level: parsed.data.level,
      estimated_minutes: parsed.data.estimatedMinutes,
      published: parsed.data.published,
      featured: parsed.data.featured,
      certificate_enabled: parsed.data.certificateEnabled,
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to update course");
  }

  if (parsed.data.courseKind === "external") {
    await ensureExternalCourseShell(data.id, data.title);
  }

  return actionSuccess(data as Course);
}

export async function createModule(
  formData: FormData,
): Promise<ActionResult<Module>> {
  await requireAdmin();

  const courseId = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!courseId || !title) {
    return actionError("Course and title are required");
  }

  const now = new Date().toISOString();
  const module: Module = {
    id: generateId(),
    course_id: courseId,
    title,
    description: description || null,
    sort_order: sortOrder,
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured()) {
    return actionSuccess(createDemoModule(module));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .insert(module)
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to create module");
  }

  return actionSuccess(data as Module);
}

export async function createLesson(
  formData: FormData,
): Promise<ActionResult<Lesson>> {
  await requireAdmin();

  const parsed = lessonCreateSchema.safeParse({
    moduleId: formData.get("moduleId"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    learningObjective: formData.get("learningObjective"),
    videoProvider: formData.get("videoProvider"),
    videoId: formData.get("videoId"),
    videoUrl: formData.get("videoUrl"),
    durationSeconds: formData.get("durationSeconds"),
    writtenContent: formData.get("writtenContent"),
    published: formData.get("published") === "true",
    required: formData.get("required") !== "false",
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid lesson data");
  }

  const now = new Date().toISOString();
  const lesson: Lesson = {
    id: generateId(),
    module_id: parsed.data.moduleId,
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    learning_objective: parsed.data.learningObjective ?? null,
    video_provider: parsed.data.videoProvider,
    video_id: parsed.data.videoId ?? null,
    video_url: parsed.data.videoUrl ?? null,
    duration_seconds: parsed.data.durationSeconds,
    thumbnail_url: null,
    transcript: null,
    written_content: parsed.data.writtenContent ?? null,
    captions_url: null,
    processing_status: "ready",
    published: parsed.data.published,
    required: parsed.data.required,
    sort_order: parsed.data.sortOrder,
    version: "1.0",
    last_reviewed_at: null,
    review_status: "current",
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured()) {
    return actionSuccess(createDemoLesson(lesson));
  }

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
      written_content: lesson.written_content,
      published: lesson.published,
      required: lesson.required,
      sort_order: lesson.sort_order,
    })
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to create lesson");
  }

  return actionSuccess(data as Lesson);
}

export async function updateLesson(
  id: string,
  formData: FormData,
): Promise<ActionResult<Lesson>> {
  await requireAdmin();

  const parsed = lessonUpdateSchema.safeParse({
    moduleId: formData.get("moduleId") || undefined,
    title: formData.get("title") || undefined,
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    learningObjective: formData.get("learningObjective") || undefined,
    videoProvider: formData.get("videoProvider") || undefined,
    videoId: formData.get("videoId") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    durationSeconds: formData.get("durationSeconds") || undefined,
    writtenContent: formData.get("writtenContent") || undefined,
    published:
      formData.has("published")
        ? formData.get("published") === "true"
        : undefined,
    required:
      formData.has("required") ? formData.get("required") !== "false" : undefined,
    sortOrder: formData.get("sortOrder") || undefined,
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid lesson data");
  }

  if (!isSupabaseConfigured()) {
    const updated = updateDemoLesson(id, {
      module_id: parsed.data.moduleId,
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      learning_objective: parsed.data.learningObjective,
      video_provider: parsed.data.videoProvider,
      video_id: parsed.data.videoId,
      video_url: parsed.data.videoUrl,
      duration_seconds: parsed.data.durationSeconds,
      written_content: parsed.data.writtenContent,
      published: parsed.data.published,
      required: parsed.data.required,
      sort_order: parsed.data.sortOrder,
    });

    if (!updated) {
      return actionError("Lesson not found");
    }

    return actionSuccess(updated);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .update({
      module_id: parsed.data.moduleId,
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      learning_objective: parsed.data.learningObjective,
      video_provider: parsed.data.videoProvider,
      video_id: parsed.data.videoId,
      video_url: parsed.data.videoUrl,
      duration_seconds: parsed.data.durationSeconds,
      written_content: parsed.data.writtenContent,
      published: parsed.data.published,
      required: parsed.data.required,
      sort_order: parsed.data.sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to update lesson");
  }

  return actionSuccess(data as Lesson);
}

export async function publishCourse(
  courseId: string,
): Promise<ActionResult<Course>> {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    const updated = updateDemoCourse(courseId, {
      published: true,
      status: "published",
    });

    if (!updated) {
      return actionError("Course not found");
    }

    // Learner lesson pages require lesson.published — cascade publish.
    const lessons = getOrderedLessonsForCourse(courseId);
    for (const lesson of lessons) {
      updateDemoLesson(lesson.id, { published: true });
    }

    return actionSuccess(updated);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .update({
      published: true,
      status: "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseId)
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to publish course");
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId);

  const moduleIds = (modules ?? []).map((row) => row.id);
  if (moduleIds.length > 0) {
    await supabase
      .from("lessons")
      .update({
        published: true,
        updated_at: new Date().toISOString(),
      })
      .in("module_id", moduleIds);
  }

  return actionSuccess(data as Course);
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<ActionResult<{ userId: string; role: UserRole }>> {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    const updated = updateDemoUserRole(userId, role);
    if (!updated) {
      return actionError("User not found");
    }

    return actionSuccess({ userId, role });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return actionError(error.message);
  }

  return actionSuccess({ userId, role });
}

export async function createQuizWithQuestions(input: {
  lessonId: string;
  title: string;
  description?: string | null;
  passingScore: number;
  required?: boolean;
  questions: Array<{
    question: string;
    explanation?: string | null;
    options: Array<{ text: string; isCorrect: boolean }>;
  }>;
}): Promise<ActionResult<Quiz>> {
  await requireAdmin();

  const now = new Date().toISOString();
  const quiz: Quiz = {
    id: generateId(),
    lesson_id: input.lessonId,
    title: input.title,
    description: input.description ?? null,
    passing_score: input.passingScore,
    required: input.required ?? true,
    created_at: now,
    updated_at: now,
  };

  const questionPayload = input.questions.map((item, index) => {
    const questionId = generateId();
    return {
      question: {
        id: questionId,
        quiz_id: quiz.id,
        question: item.question,
        explanation: item.explanation ?? null,
        sort_order: index + 1,
        created_at: now,
      },
      options: item.options.map((option, optionIndex) => ({
        id: generateId(),
        question_id: questionId,
        option_text: option.text,
        is_correct: option.isCorrect,
        sort_order: optionIndex + 1,
      })),
    };
  });

  if (!isSupabaseConfigured()) {
    return actionSuccess(
      createDemoQuizWithQuestions({ quiz, questions: questionPayload }),
    );
  }

  const supabase = await createClient();
  const { data: quizRow, error: quizError } = await supabase
    .from("quizzes")
    .insert(quiz)
    .select("*")
    .single();

  if (quizError || !quizRow) {
    return actionError(quizError?.message ?? "Unable to create quiz");
  }

  for (const item of questionPayload) {
    const { data: questionRow, error: questionError } = await supabase
      .from("quiz_questions")
      .insert(item.question)
      .select("id")
      .single();

    if (questionError || !questionRow) {
      return actionError(questionError?.message ?? "Unable to create question");
    }

    const { error: optionsError } = await supabase.from("quiz_options").insert(
      item.options.map((option) => ({
        ...option,
        question_id: questionRow.id,
      })),
    );

    if (optionsError) {
      return actionError(optionsError.message);
    }
  }

  return actionSuccess(quizRow as Quiz);
}

export async function saveAnnouncement(
  formData: FormData,
): Promise<ActionResult<Announcement>> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const type = String(formData.get("type") ?? "info").trim();
  const published = formData.get("published") === "true";

  if (!title || !content) {
    return actionError("Title and content are required");
  }

  if (!isSupabaseConfigured()) {
    if (id) {
      const updated = updateDemoAnnouncement(id, {
        title,
        content,
        type,
        published,
      });
      if (!updated) return actionError("Announcement not found");
      return actionSuccess(updated);
    }

    return actionSuccess(
      createDemoAnnouncement({ title, content, type, published }),
    );
  }

  const supabase = await createClient();
  if (id) {
    const { data, error } = await supabase
      .from("announcements")
      .update({ title, content, type, published })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) return actionError(error?.message ?? "Unable to update");
    return actionSuccess(data as Announcement);
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert({ title, content, type, published })
    .select("*")
    .single();

  if (error || !data) return actionError(error?.message ?? "Unable to create");
  return actionSuccess(data as Announcement);
}

export async function removeAnnouncement(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    if (!deleteDemoAnnouncement(id)) {
      return actionError("Announcement not found");
    }
    return actionSuccess({ id });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return actionError(error.message);
  return actionSuccess({ id });
}

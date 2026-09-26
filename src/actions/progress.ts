"use server";

import { issueCertificate } from "@/actions/certificates";
import { requireCurrentUser } from "@/lib/auth/get-user";
import { actionError, actionSuccess, type ActionResult } from "@/lib/auth/action-result";
import {
  addDemoQuizAttempt,
  completeDemoEnrollment,
  enrollDemoUser,
  getCourseById,
  getCourseWithModules,
  getDemoEnrollment,
  getDemoLessonProgressForUser,
  getDemoQuizAttempts,
  getLessonById,
  getQuizById,
  getQuizzesForCourse,
  isSupabaseConfigured,
  upsertDemoLessonProgress,
} from "@/lib/data/demo-store";
import {
  isLessonCompleteByWatch,
  shouldCompleteCourse,
} from "@/lib/progress/calculate";
import { createClient } from "@/lib/supabase/server";
import { quizSubmitSchema } from "@/lib/validations/schemas";
import type { Certificate, Enrollment, LessonProgress, QuizAttempt } from "@/types/database";

export async function updateLessonProgress(input: {
  lessonId: string;
  lastPosition: number;
  watchedSeconds: number;
  markComplete?: boolean;
}): Promise<ActionResult<LessonProgress>> {
  const user = await requireCurrentUser();
  const lesson = getLessonById(input.lessonId);

  if (!lesson) {
    return actionError("Lesson not found");
  }

  const existing = !isSupabaseConfigured()
    ? getDemoLessonProgressForUser(user.id).find(
        (item) => item.lesson_id === input.lessonId,
      )
    : null;

  const completed =
    existing?.completed === true ||
    input.markComplete === true ||
    isLessonCompleteByWatch(input.watchedSeconds, lesson.duration_seconds);

  if (!isSupabaseConfigured()) {
    const progress = upsertDemoLessonProgress({
      userId: user.id,
      lessonId: input.lessonId,
      lastPosition: input.lastPosition,
      watchedSeconds: input.watchedSeconds,
      completed,
    });
    return actionSuccess(progress);
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: existingRow } = await supabase
    .from("lesson_progress")
    .select("completed, completed_at")
    .eq("user_id", user.id)
    .eq("lesson_id", input.lessonId)
    .maybeSingle();

  const stickyCompleted = existingRow?.completed === true || completed;
  const completedAt = stickyCompleted
    ? existingRow?.completed_at ?? now
    : null;

  const { data, error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: user.id,
        lesson_id: input.lessonId,
        last_position: input.lastPosition,
        watched_seconds: input.watchedSeconds,
        completed: stickyCompleted,
        completed_at: completedAt,
        updated_at: now,
      },
      { onConflict: "user_id,lesson_id" },
    )
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to update progress");
  }

  return actionSuccess(data as LessonProgress);
}

export async function enrollInCourse(
  courseId: string,
): Promise<ActionResult<Enrollment>> {
  const user = await requireCurrentUser();
  const course = getCourseById(courseId);

  if (!course) {
    return actionError("Course not found");
  }

  if (!isSupabaseConfigured()) {
    const enrollment = enrollDemoUser(user.id, courseId);
    return actionSuccess(enrollment);
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    return actionSuccess(existing as Enrollment);
  }

  const { data, error } = await supabase
    .from("enrollments")
    .insert({
      user_id: user.id,
      course_id: courseId,
      status: "active",
    })
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to enroll");
  }

  return actionSuccess(data as Enrollment);
}

export interface QuizQuestionResult {
  questionId: string;
  correct: boolean;
  selectedOptionId: string | undefined;
  correctOptionId: string;
  explanation: string | null;
}

export interface QuizSubmitResult {
  attempt: QuizAttempt;
  results: QuizQuestionResult[];
}

export async function submitQuiz(input: {
  quizId: string;
  answers: Record<string, string>;
}): Promise<ActionResult<QuizSubmitResult>> {
  const user = await requireCurrentUser();
  const parsed = quizSubmitSchema.safeParse(input);

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid quiz submission");
  }

  const quiz = getQuizById(parsed.data.quizId);
  if (!quiz) {
    return actionError("Quiz not found");
  }

  let correct = 0;
  const total = quiz.questions.length;
  const results: QuizQuestionResult[] = [];

  for (const question of quiz.questions) {
    const selectedOptionId = parsed.data.answers[question.id];
    const selected = question.options.find((option) => option.id === selectedOptionId);
    const correctOption = question.options.find((option) => option.is_correct);
    const isCorrect = selected?.is_correct === true;

    if (isCorrect) {
      correct += 1;
    }

    results.push({
      questionId: question.id,
      correct: isCorrect,
      selectedOptionId,
      correctOptionId: correctOption?.id ?? "",
      explanation: question.explanation,
    });
  }

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= quiz.passing_score;

  if (!isSupabaseConfigured()) {
    const attempt = addDemoQuizAttempt({
      user_id: user.id,
      quiz_id: quiz.id,
      score,
      passed,
      answers: parsed.data.answers,
      attempted_at: new Date().toISOString(),
    });
    return actionSuccess({ attempt, results });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_id: quiz.id,
      score,
      passed,
      answers: parsed.data.answers,
    })
    .select("*")
    .single();

  if (error || !data) {
    return actionError(error?.message ?? "Unable to submit quiz");
  }

  return actionSuccess({
    attempt: data as QuizAttempt,
    results,
  });
}

export async function completeCourseIfEligible(
  courseId: string,
): Promise<ActionResult<{ certificate: Certificate | null; completed: boolean }>> {
  const user = await requireCurrentUser();
  const courseWithModules = getCourseWithModules(courseId);

  if (!courseWithModules) {
    return actionError("Course not found");
  }

  const lessons = courseWithModules.modules.flatMap((module) => module.lessons);
  const lessonIds = lessons.map((lesson) => lesson.id);

  if (!isSupabaseConfigured()) {
    if (!getDemoEnrollment(user.id, courseId)) {
      return actionError("You must enroll before completing the course");
    }

    const progressByLesson = new Map(
      getDemoLessonProgressForUser(user.id).map((item) => [item.lesson_id, item]),
    );

    const lessonInputs = lessons.map((lesson) => ({
      lessonId: lesson.id,
      required: lesson.required,
      completed: progressByLesson.get(lesson.id)?.completed === true,
    }));

    const quizPassInputs = getQuizzesForCourse(courseId).map((quiz) => {
      const bestAttempt = getDemoQuizAttempts(user.id, quiz.id).sort(
        (a, b) => b.score - a.score,
      )[0];
      return {
        quizId: quiz.id,
        lessonId: quiz.lesson_id,
        required: quiz.required,
        passed: bestAttempt?.passed ?? false,
      };
    });

    const eligible = shouldCompleteCourse(lessonInputs, lessonInputs, quizPassInputs);

    if (!eligible) {
      return actionSuccess({ certificate: null, completed: false });
    }

    completeDemoEnrollment(user.id, courseId);
    const certificateResult = await issueCertificate(user.id, courseId);

    return actionSuccess({
      certificate: certificateResult.success ? certificateResult.data : null,
      completed: true,
    });
  }

  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) {
    return actionError("You must enroll before completing the course");
  }

  const { data: progressRows } = lessonIds.length
    ? await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds)
    : { data: [] as Array<{ lesson_id: string; completed: boolean }> };

  const { data: quizRows } = lessonIds.length
    ? await supabase
        .from("quizzes")
        .select("id, lesson_id, required")
        .in("lesson_id", lessonIds)
    : { data: [] as Array<{ id: string; lesson_id: string; required: boolean }> };

  const quizIds = (quizRows ?? []).map((quiz) => quiz.id);
  const { data: attemptRows } = quizIds.length
    ? await supabase
        .from("quiz_attempts")
        .select("quiz_id, passed")
        .eq("user_id", user.id)
        .in("quiz_id", quizIds)
    : { data: [] as Array<{ quiz_id: string; passed: boolean }> };

  const lessonInputs = lessons.map((lesson) => ({
    lessonId: lesson.id,
    required: lesson.required,
    completed:
      progressRows?.find((row) => row.lesson_id === lesson.id)?.completed === true,
  }));

  const quizPassInputs = (quizRows ?? []).map((quiz) => ({
    quizId: quiz.id,
    lessonId: quiz.lesson_id,
    required: quiz.required,
    passed:
      attemptRows?.some((attempt) => attempt.quiz_id === quiz.id && attempt.passed) ??
      false,
  }));

  const eligible = shouldCompleteCourse(lessonInputs, lessonInputs, quizPassInputs);

  if (!eligible) {
    return actionSuccess({ certificate: null, completed: false });
  }

  await supabase
    .from("enrollments")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  const certificateResult = await issueCertificate(user.id, courseId);

  return actionSuccess({
    certificate: certificateResult.success ? certificateResult.data : null,
    completed: true,
  });
}

export const WATCH_COMPLETION_THRESHOLD = 80;

export interface LessonCompletionInput {
  lessonId: string;
  required: boolean;
  completed: boolean;
}

export interface QuizPassInput {
  quizId: string;
  lessonId: string;
  required: boolean;
  passed: boolean;
}

export type ProgressItemKind = "lesson" | "quiz";

export interface CourseProgressItem {
  id: string;
  kind: ProgressItemKind;
  required: boolean;
  completed: boolean;
  title?: string;
}

export interface CourseProgressRollup {
  completedRequired: number;
  totalRequired: number;
  percent: number;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  allRequiredComplete: boolean;
  nextItem: CourseProgressItem | null;
}

export function calculateCourseProgress(
  completedRequired: number,
  totalRequired: number,
): number {
  if (totalRequired <= 0) {
    return 0;
  }

  const ratio = completedRequired / totalRequired;
  return Math.round(Math.max(0, Math.min(100, ratio * 100)));
}

export function isLessonCompleteByWatch(
  watched: number,
  duration: number,
  threshold = WATCH_COMPLETION_THRESHOLD,
): boolean {
  if (duration <= 0) {
    return false;
  }

  const percentWatched = (watched / duration) * 100;
  return percentWatched >= threshold;
}

export function rollupCourseProgress(
  items: CourseProgressItem[],
): CourseProgressRollup {
  const required = items.filter((item) => item.required);
  const completed = required.filter((item) => item.completed);
  const lessons = required.filter((item) => item.kind === "lesson");
  const quizzes = required.filter((item) => item.kind === "quiz");

  return {
    completedRequired: completed.length,
    totalRequired: required.length,
    percent: calculateCourseProgress(completed.length, required.length),
    completedLessons: lessons.filter((item) => item.completed).length,
    totalLessons: lessons.length,
    completedQuizzes: quizzes.filter((item) => item.completed).length,
    totalQuizzes: quizzes.length,
    allRequiredComplete:
      required.length > 0 && completed.length === required.length,
    nextItem: required.find((item) => !item.completed) ?? null,
  };
}

export function summarizeCourseProgress(input: {
  lessons: Array<{ id: string; required: boolean; published?: boolean }>;
  quizzes: Array<{ id: string; required: boolean }>;
  completedLessonIds: Iterable<string>;
  passedQuizIds: Iterable<string>;
}): CourseProgressRollup {
  return rollupCourseProgress(buildCourseProgressItems(input));
}

export function buildCourseProgressItems(input: {
  lessons: Array<{ id: string; required: boolean; published?: boolean }>;
  quizzes: Array<{ id: string; required: boolean }>;
  completedLessonIds: Iterable<string>;
  passedQuizIds: Iterable<string>;
}): CourseProgressItem[] {
  const completedLessons = new Set(input.completedLessonIds);
  const passedQuizzes = new Set(input.passedQuizIds);

  const lessonItems: CourseProgressItem[] = input.lessons
    .filter((lesson) => lesson.published !== false)
    .map((lesson) => ({
      id: lesson.id,
      kind: "lesson" as const,
      required: lesson.required,
      completed: completedLessons.has(lesson.id),
    }));

  const quizItems: CourseProgressItem[] = input.quizzes.map((quiz) => ({
    id: quiz.id,
    kind: "quiz" as const,
    required: quiz.required,
    completed: passedQuizzes.has(quiz.id),
  }));

  return [...lessonItems, ...quizItems];
}

export function shouldCompleteCourse(
  lessons: LessonCompletionInput[],
  progress: LessonCompletionInput[],
  quizPasses: QuizPassInput[],
): boolean {
  const progressByLesson = new Map(progress.map((item) => [item.lessonId, item]));
  return summarizeCourseProgress({
    lessons: lessons.map((lesson) => ({
      id: lesson.lessonId,
      required: lesson.required,
    })),
    quizzes: quizPasses.map((quiz) => ({
      id: quiz.quizId,
      required: quiz.required,
    })),
    completedLessonIds: lessons
      .filter((lesson) => progressByLesson.get(lesson.lessonId)?.completed)
      .map((lesson) => lesson.lessonId),
    passedQuizIds: quizPasses
      .filter((quiz) => quiz.passed)
      .map((quiz) => quiz.quizId),
  }).allRequiredComplete;
}

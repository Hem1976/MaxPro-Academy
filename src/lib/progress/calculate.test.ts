import { describe, expect, it } from "vitest";
import {
  calculateCourseProgress,
  isLessonCompleteByWatch,
  shouldCompleteCourse,
  summarizeCourseProgress,
  WATCH_COMPLETION_THRESHOLD,
} from "@/lib/progress/calculate";
import { canAccessAdmin, isAdmin, isStaff, isSuperAdmin } from "@/lib/auth/roles";
import {
  canUsePortal,
  homeForRole,
  loginForPath,
  loginForRole,
  safeAdminNext,
  safeLearnerNext,
} from "@/lib/auth/portals";
import {
  getCourseBySlug,
  getCourseProgress,
  getCourses,
  getLearnerAnalyticsDetail,
  getLearnerAnalyticsSummaries,
  getLessonBySlugs,
  getProducts,
  searchContent,
} from "@/lib/data/demo-store";
import { formatDuration, slugify } from "@/lib/utils";
import { loginSchema, signupSchema } from "@/lib/validations/schemas";

describe("progress calculation", () => {
  it("calculates course progress percentage", () => {
    expect(calculateCourseProgress(0, 10)).toBe(0);
    expect(calculateCourseProgress(5, 10)).toBe(50);
    expect(calculateCourseProgress(10, 10)).toBe(100);
    expect(calculateCourseProgress(1, 0)).toBe(0);
  });

  it("marks lesson complete by watch threshold", () => {
    expect(isLessonCompleteByWatch(80, 100, WATCH_COMPLETION_THRESHOLD)).toBe(
      true,
    );
    expect(isLessonCompleteByWatch(79, 100, WATCH_COMPLETION_THRESHOLD)).toBe(
      false,
    );
    expect(isLessonCompleteByWatch(80, 0)).toBe(false);
  });

  it("counts required lessons and quizzes as equal-weight items", () => {
    const lessons = Array.from({ length: 12 }, (_, index) => ({
      id: `lesson-${index + 1}`,
      required: true,
    }));
    const quizzes = [{ id: "quiz-1", required: true }];

    expect(
      summarizeCourseProgress({
        lessons,
        quizzes,
        completedLessonIds: lessons.map((lesson) => lesson.id),
        passedQuizIds: [],
      }).percent,
    ).toBe(92);

    expect(
      summarizeCourseProgress({
        lessons,
        quizzes,
        completedLessonIds: lessons.map((lesson) => lesson.id),
        passedQuizIds: ["quiz-1"],
      }).percent,
    ).toBe(100);
  });

  it("ignores optional items when rolling up course progress", () => {
    const rollup = summarizeCourseProgress({
      lessons: [
        { id: "required-lesson", required: true },
        { id: "optional-lesson", required: false },
      ],
      quizzes: [
        { id: "required-quiz", required: true },
        { id: "optional-quiz", required: false },
      ],
      completedLessonIds: ["required-lesson"],
      passedQuizIds: [],
    });

    expect(rollup.totalRequired).toBe(2);
    expect(rollup.percent).toBe(50);
    expect(rollup.nextItem?.id).toBe("required-quiz");
    expect(rollup.allRequiredComplete).toBe(false);
  });

  it("requires all required lessons and quizzes to complete a course", () => {
    expect(
      shouldCompleteCourse(
        [
          { lessonId: "a", required: true, completed: false },
          { lessonId: "b", required: true, completed: false },
        ],
        [
          { lessonId: "a", required: true, completed: true },
          { lessonId: "b", required: true, completed: true },
        ],
        [
          {
            quizId: "q1",
            lessonId: "a",
            required: true,
            passed: true,
          },
        ],
      ),
    ).toBe(true);

    expect(
      shouldCompleteCourse(
        [
          { lessonId: "a", required: true, completed: false },
          { lessonId: "b", required: true, completed: false },
        ],
        [{ lessonId: "a", required: true, completed: true }],
        [
          {
            quizId: "q1",
            lessonId: "a",
            required: true,
            passed: true,
          },
        ],
      ),
    ).toBe(false);
  });
});

describe("authorization roles", () => {
  it("identifies staff and admin roles", () => {
    expect(isStaff("customer")).toBe(false);
    expect(isStaff("trainer")).toBe(true);
    expect(isAdmin("content_admin")).toBe(true);
    expect(isAdmin("trainer")).toBe(false);
    expect(isSuperAdmin("super_admin")).toBe(true);
    expect(canAccessAdmin("trainer")).toBe(true);
    expect(canAccessAdmin("customer")).toBe(false);
  });
});

describe("auth portals", () => {
  it("keeps learner and staff sign-in destinations separate", () => {
    expect(canUsePortal("customer", "learner")).toBe(true);
    expect(canUsePortal("customer", "admin")).toBe(false);
    expect(canUsePortal("super_admin", "admin")).toBe(true);
    expect(canUsePortal("super_admin", "learner")).toBe(false);
    expect(safeLearnerNext("/admin/dashboard")).toBe("/dashboard");
    expect(safeAdminNext("/dashboard")).toBe("/admin/dashboard");
    expect(homeForRole("customer")).toBe("/dashboard");
    expect(homeForRole("super_admin")).toBe("/admin/dashboard");
    expect(loginForRole("customer")).toBe("/login");
    expect(loginForRole("super_admin")).toBe("/admin/login");
    expect(loginForPath("/admin/users")).toBe("/admin/login");
    expect(loginForPath("/dashboard")).toBe("/login");
  });
});

describe("demo store catalog", () => {
  it("exposes the full Maxpro product catalog", () => {
    const published = getProducts().filter((p) => p.published);
    expect(new Set(published.map((p) => p.slug))).toEqual(
      new Set([
        "rockey",
        "rocketsales-pharma",
        "rocket-order-ai",
        "rockey-agro",
        "general-training",
      ]),
    );
  });

  it("loads Fundamentals courses for core products", () => {
    expect(getCourseBySlug("rockey-fundamentals")?.title).toBe(
      "Rockey Fundamentals",
    );
    expect(getCourseBySlug("rocketsales-pharma-fundamentals")?.title).toBe(
      "RocketSales Pharma Fundamentals",
    );
    expect(getCourseBySlug("rockey-agro-fundamentals")?.title).toBe(
      "Rockey Agro Fundamentals",
    );
  });

  it("loads Rockey Fundamentals with lessons", () => {
    const course = getCourseBySlug("rockey-fundamentals");
    expect(course?.title).toBe("Rockey Fundamentals");
    const lesson = getLessonBySlugs(
      "rockey-fundamentals",
      "creating-a-sales-order",
    );
    expect(lesson?.title).toBe("Creating a Sales Order");
  });

  it("searches courses and lessons", () => {
    const results = searchContent("sales order");
    expect(results.length).toBeGreaterThan(0);
  });

  it("lists published courses only when filtered", () => {
    const courses = getCourses({ publishedOnly: true });
    expect(courses.every((c) => c.published)).toBe(true);
  });
});

describe("validation", () => {
  it("validates login and signup payloads", () => {
    expect(
      loginSchema.safeParse({
        email: "learner@example.com",
        password: "password123",
      }).success,
    ).toBe(true);

    expect(
      loginSchema.safeParse({ email: "bad", password: "x" }).success,
    ).toBe(false);

    expect(
      signupSchema.safeParse({
        email: "learner@example.com",
        password: "password123",
        confirmPassword: "password123",
        fullName: "Ada Learner",
      }).success,
    ).toBe(true);
  });
});

describe("utils", () => {
  it("formats duration and slugifies titles", () => {
    expect(formatDuration(90)).toBe("1m");
    expect(formatDuration(3661)).toMatch(/1h/);
    expect(slugify("Rockey Fundamentals")).toBe("rockey-fundamentals");
  });
});

describe("learner analytics", () => {
  it("reports per-user course progress for seeded learners", () => {
    const summaries = getLearnerAnalyticsSummaries();
    const amina = summaries.find(
      (item) => item.email === "amina.saleh@maxproinfotech.com",
    );

    expect(amina).toBeTruthy();
    expect(amina?.enrolledCourses).toBeGreaterThanOrEqual(2);
    expect(amina?.completedCourses).toBeGreaterThanOrEqual(1);
    expect(amina?.certificates).toBeGreaterThanOrEqual(1);

    const detail = getLearnerAnalyticsDetail(amina!.userId);
    expect(detail?.courses.length).toBeGreaterThanOrEqual(2);
    expect(
      detail?.courses.some((course) => course.courseSlug === "rockey-fundamentals"),
    ).toBe(true);

    const rockey = getCourseBySlug("rockey-fundamentals");
    const calculus = getCourseBySlug("essence-of-calculus");
    expect(rockey && calculus).toBeTruthy();

    const rockeyProgress = getCourseProgress(amina!.userId, rockey!.id);
    expect(rockeyProgress.percent).toBe(100);
    expect(rockeyProgress.completedQuizzes).toBe(rockeyProgress.totalQuizzes);
    expect(rockeyProgress.totalQuizzes).toBeGreaterThan(0);

    const calculusProgress = getCourseProgress(amina!.userId, calculus!.id);
    expect(calculusProgress.completedLessons).toBe(4);
    expect(calculusProgress.completedQuizzes).toBe(0);
    expect(calculusProgress.percent).toBe(
      Math.round((4 / calculusProgress.totalRequired) * 100),
    );
    expect(calculusProgress.percent).toBeLessThan(100);
  });
});

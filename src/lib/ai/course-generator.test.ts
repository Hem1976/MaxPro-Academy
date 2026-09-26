import { describe, expect, it } from "vitest";
import {
  buildCourseFromPlaylistVideos,
  buildFallbackCourseDraft,
} from "@/lib/ai/course-generator";
import {
  aiCourseGenerateInputSchema,
  generatedCourseDraftSchema,
} from "@/lib/ai/course-schema";
import {
  extractPlaylistId,
  extractYoutubeVideoId,
} from "@/lib/youtube/playlist";

describe("AI course schema", () => {
  it("validates generate input", () => {
    const parsed = aiCourseGenerateInputSchema.safeParse({
      productId: "",
      courseTitle: "Sales Fundamentals",
      topic: "Sales",
      moduleCount: 3,
      lessonsPerModule: 3,
      quizQuestionCount: 5,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty topics", () => {
    const parsed = aiCourseGenerateInputSchema.safeParse({
      topic: "",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("youtube url parsing", () => {
  it("extracts playlist and video ids", () => {
    expect(
      extractPlaylistId(
        "https://www.youtube.com/playlist?list=PLdO5xp5occOw1XQC6Tv6mVQ8NuYyE3XMm",
      ),
    ).toBe("PLdO5xp5occOw1XQC6Tv6mVQ8NuYyE3XMm");

    expect(
      extractYoutubeVideoId("https://youtu.be/3eM4psQQiQ4?si=abc"),
    ).toBe("3eM4psQQiQ4");
  });
});

describe("playlist course mapping", () => {
  it("creates one lesson per playlist video with youtube ids", () => {
    const draft = buildCourseFromPlaylistVideos(
      {
        productId: "",
        topic: "Sales training",
        courseTitle: "Sales Mastery",
        moduleCount: 3,
        lessonsPerModule: 3,
        quizQuestionCount: 4,
        productName: "General Training",
      },
      {
        playlistId: "PLtest",
        title: "Sales Training Videos",
        source: "playlist",
        videos: [
          {
            videoId: "aaaaaaaaaaa",
            title: "Intro to Sales",
            index: 0,
            url: "https://www.youtube.com/watch?v=aaaaaaaaaaa",
            embedUrl: "https://www.youtube.com/embed/aaaaaaaaaaa",
            durationSeconds: 600,
          },
          {
            videoId: "bbbbbbbbbbb",
            title: "Buyer Journey",
            index: 1,
            url: "https://www.youtube.com/watch?v=bbbbbbbbbbb",
            embedUrl: "https://www.youtube.com/embed/bbbbbbbbbbb",
            durationSeconds: 720,
          },
          {
            videoId: "ccccccccccc",
            title: "Handling Objections",
            index: 2,
            url: "https://www.youtube.com/watch?v=ccccccccccc",
            embedUrl: "https://www.youtube.com/embed/ccccccccccc",
            durationSeconds: 540,
          },
        ],
      },
    );

    const parsed = generatedCourseDraftSchema.safeParse(draft);
    expect(parsed.success).toBe(true);

    const lessons = draft.modules.flatMap((m) => m.lessons);
    expect(lessons).toHaveLength(3);
    expect(lessons.map((l) => l.youtubeVideoId)).toEqual([
      "aaaaaaaaaaa",
      "bbbbbbbbbbb",
      "ccccccccccc",
    ]);
    expect(lessons[0].title).toContain("Intro");
    expect(draft.quiz.questions).toHaveLength(3);
    expect(draft.quiz.questions[0].question).toContain("Intro to Sales");
    expect(draft.quiz.questions[2].question).toContain("Handling Objections");
  });
});

describe("fallback course generator", () => {
  it("builds a valid full course draft", () => {
    const draft = buildFallbackCourseDraft({
      productId: "11111111-1111-1111-1111-111111111101",
      courseTitle: "Sales Fundamentals",
      topic: "Sales",
      audience: "Sales reps",
      moduleCount: 3,
      lessonsPerModule: 3,
      quizQuestionCount: 5,
      productName: "Rockey",
    });

    const parsed = generatedCourseDraftSchema.safeParse(draft);
    expect(parsed.success).toBe(true);
    expect(draft.title).toBe("Sales Fundamentals");
    expect(draft.modules).toHaveLength(3);
    expect(draft.modules[0].lessons).toHaveLength(3);
    expect(draft.quiz.questions).toHaveLength(9);
  });
});

describe("playlist course quiz seed", () => {
  it("covers every Essence of Calculus lesson", async () => {
    const { getCourseBySlug, getCourseQuizWithQuestions } = await import(
      "@/lib/data/demo-store"
    );
    const course = getCourseBySlug("essence-of-calculus");
    expect(course).toBeTruthy();

    const quiz = getCourseQuizWithQuestions(course!.id);
    expect(quiz?.questions).toHaveLength(12);
    expect(
      quiz?.questions.every((question) => (question.options?.length ?? 0) === 4),
    ).toBe(true);
    expect(
      quiz?.questions.every(
        (question) =>
          (question.options ?? []).filter((option) => option.is_correct)
            .length === 1,
      ),
    ).toBe(true);
  });
});

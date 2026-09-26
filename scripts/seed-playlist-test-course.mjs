import { writeFileSync } from "node:fs";
import { resolveYoutubeSource } from "../src/lib/youtube/playlist.ts";

const PLAYLIST =
  "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr";
const COURSE_ID = "22222222-2222-2222-2222-222222222299";
const PRODUCT_ID = "11111111-1111-1111-1111-111111111199";
const TIMESTAMP = "2026-03-19T12:00:00.000Z";

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const pl = await resolveYoutubeSource(PLAYLIST);
if (!pl.videos.length) {
  throw new Error("No videos resolved from playlist");
}

const moduleDefs = [
  {
    id: "33333333-3333-3333-3333-333333333391",
    title: "Module 1",
    start: 0,
    end: 4,
  },
  {
    id: "33333333-3333-3333-3333-333333333392",
    title: "Module 2",
    start: 4,
    end: 8,
  },
  {
    id: "33333333-3333-3333-3333-333333333393",
    title: "Module 3",
    start: 8,
    end: 12,
  },
];

const moduleRows = moduleDefs.map((m, i) => ({
  id: m.id,
  course_id: COURSE_ID,
  title: m.title,
  description: "Lessons from the Essence of calculus playlist.",
  sort_order: i + 1,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
}));

const lessons = [];
let lessonNum = 0;
for (const m of moduleDefs) {
  const slice = pl.videos.slice(m.start, m.end);
  slice.forEach((v, li) => {
    lessonNum += 1;
    const slug = slugify(v.title) || `lesson-${lessonNum}`;
    lessons.push({
      id: `44444444-4444-4444-4444-4444444449${String(lessonNum).padStart(2, "0")}`,
      module_id: m.id,
      title: v.title.slice(0, 200),
      slug,
      description: `Watch and apply: ${v.title.slice(0, 100)}`,
      learning_objective: `Learn the key ideas from “${v.title.slice(0, 80)}” and apply them in practice.`,
      video_provider: "youtube",
      video_id: v.videoId,
      video_url: `https://www.youtube.com/embed/${v.videoId}`,
      duration_seconds: 600,
      thumbnail_url: null,
      transcript: null,
      written_content: `## What you will learn\n\nWatch the embedded video for this lesson, note the main points, and practice one idea before continuing.\n\n## Video\n\nYouTube id: ${v.videoId}`,
      captions_url: null,
      processing_status: "ready",
      published: true,
      required: true,
      sort_order: li + 1,
      version: "1.0",
      last_reviewed_at: null,
      review_status: "current",
      created_at: TIMESTAMP,
      updated_at: TIMESTAMP,
    });
  });
}

const lastLessonId = lessons[lessons.length - 1].id;
const quizId = "55555555-5555-5555-5555-555555555299";

const file = `/**
 * Published playlist-mapped course for learner testing.
 * Source: Essence of calculus YouTube playlist
 */

import type {
  Course,
  Lesson,
  Module,
  Quiz,
  QuizOption,
  QuizQuestion,
} from "@/types/database";

const TIMESTAMP = "${TIMESTAMP}";

export const PLAYLIST_TEST_COURSE_ID = "${COURSE_ID}";

export const playlistTestCourse: Course = {
  id: PLAYLIST_TEST_COURSE_ID,
  product_id: "${PRODUCT_ID}",
  title: "Essence of Calculus",
  slug: "essence-of-calculus",
  description:
    "This Maxpro Academy course is built from ${pl.videos.length} YouTube videos in \\"Essence of calculus\\". Each lesson includes the matching video plus a written walkthrough and ends with a knowledge check.",
  short_description:
    "A video-based training path covering calculus fundamentals.",
  thumbnail_url: null,
  level: "beginner",
  estimated_minutes: ${pl.videos.length * 10},
  published: true,
  featured: true,
  certificate_enabled: true,
  sort_order: 10,
  learning_outcomes: [
    "Explain the core ideas covered in calculus fundamentals",
    "Apply techniques demonstrated in the course videos",
    "Avoid common mistakes called out in the lessons",
    "Pass a knowledge check on the key concepts",
  ],
  status: "published",
  version: "1.0",
  last_reviewed_at: null,
  review_status: "current",
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
};

export const playlistTestModules: Module[] = ${JSON.stringify(moduleRows, null, 2)};

export const playlistTestLessons: Lesson[] = ${JSON.stringify(lessons, null, 2)};

export const playlistTestQuizzes: Quiz[] = [
  {
    id: "${quizId}",
    lesson_id: "${lastLessonId}",
    title: "Calculus fundamentals — Final Knowledge Check",
    description: "Confirm understanding of calculus fundamentals.",
    passing_score: 70,
    required: true,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
];

export const playlistTestQuizQuestions: QuizQuestion[] = [
  {
    id: "66666666-6666-6666-6666-666666666901",
    quiz_id: "${quizId}",
    question:
      "Based on the course videos, which practice best supports learning calculus concepts?",
    explanation:
      "Apply the lesson takeaways: prepare, listen, and follow a clear process.",
    sort_order: 1,
    created_at: TIMESTAMP,
  },
];

export const playlistTestQuizOptions: QuizOption[] = [
  {
    id: "77777777-7777-7777-7777-777777777901",
    question_id: "66666666-6666-6666-6666-666666666901",
    option_text: "Apply the lesson takeaways with a clear next action",
    is_correct: true,
    sort_order: 1,
  },
  {
    id: "77777777-7777-7777-7777-777777777902",
    question_id: "66666666-6666-6666-6666-666666666901",
    option_text: "Skip the video and guess the steps",
    is_correct: false,
    sort_order: 2,
  },
  {
    id: "77777777-7777-7777-7777-777777777903",
    question_id: "66666666-6666-6666-6666-666666666901",
    option_text: "Ignore the concepts and memorize only formulas",
    is_correct: false,
    sort_order: 3,
  },
  {
    id: "77777777-7777-7777-7777-777777777904",
    question_id: "66666666-6666-6666-6666-666666666901",
    option_text: "Rush without practicing the key points",
    is_correct: false,
    sort_order: 4,
  },
];
`;

writeFileSync(
  new URL("../src/lib/data/playlist-test-course-seed.ts", import.meta.url),
  file,
);
console.log(`Wrote seed with ${lessons.length} lessons`);

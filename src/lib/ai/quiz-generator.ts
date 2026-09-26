import { z } from "zod";
import {
  generatedQuizQuestionSchema,
  type GeneratedCourseDraft,
} from "@/lib/ai/course-schema";
import { generateLocalJson, getLocalAiStatus } from "@/lib/ai/ollama";
import type { Lesson } from "@/types/database";

const generatedCourseQuizSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(500),
  passingScore: z.number().int().min(50).max(100),
  questions: z.array(generatedQuizQuestionSchema).min(3).max(20),
});

export type GeneratedCourseQuiz = z.infer<typeof generatedCourseQuizSchema>;

export interface CourseQuizGenerationResult {
  quiz: GeneratedCourseQuiz;
  provider: "ollama" | "fallback";
  model: string;
  warning?: string;
}

function buildFallbackQuiz(
  courseTitle: string,
  lessons: Lesson[],
  questionCount: number,
): GeneratedCourseQuiz {
  const pool = lessons.length > 0 ? lessons : [{ title: courseTitle } as Lesson];
  const questions = pool.slice(0, questionCount).map((lesson, index) => {
    const distractors = pool
      .filter((item) => item.title !== lesson.title)
      .slice(0, 3)
      .map((item) => item.title);

    while (distractors.length < 3) {
      distractors.push(`Topic ${index + distractors.length + 2}`);
    }

    return {
      question: `Which lesson focuses on "${lesson.title}"?`,
      explanation: `Review the lesson titled "${lesson.title}" in this course.`,
      options: [
        { text: lesson.title, isCorrect: true },
        { text: distractors[0], isCorrect: false },
        { text: distractors[1], isCorrect: false },
        { text: distractors[2], isCorrect: false },
      ],
    };
  });

  return {
    title: `${courseTitle} — Final knowledge check`,
    description:
      "Confirm your understanding of the course videos and key concepts.",
    passingScore: 80,
    questions,
  };
}

export async function generateCourseQuizDraft(input: {
  courseTitle: string;
  courseDescription?: string | null;
  lessons: Lesson[];
  questionCount: number;
  preferAi?: boolean;
}): Promise<CourseQuizGenerationResult> {
  const questionCount = Math.min(
    20,
    Math.max(3, input.questionCount),
    input.lessons.length > 0 ? input.lessons.length : 5,
  );

  const lessonOutline = input.lessons
    .map(
      (lesson, index) =>
        `${index + 1}. ${lesson.title}${lesson.description ? ` — ${lesson.description}` : ""}`,
    )
    .join("\n");

  const status = await getLocalAiStatus();
  const useAi = input.preferAi !== false && status.available;

  if (!useAi) {
    return {
      quiz: buildFallbackQuiz(input.courseTitle, input.lessons, questionCount),
      provider: "fallback",
      model: "template-fallback",
      warning: status.available
        ? undefined
        : "Local AI (Ollama) is offline — using a template quiz. You can edit before saving.",
    };
  }

  const system = `You are a Maxpro Academy assessment designer.
Return ONLY valid JSON for a final course quiz.
Each question must have exactly one correct option.
Questions should test specific ideas from the listed lessons (one question per lesson when possible).
Do not ask generic study-habit questions.`;

  const prompt = `Create a final quiz JSON for this course.

Course: ${input.courseTitle}
Description: ${input.courseDescription ?? "Product training course"}
Lessons:
${lessonOutline || "(No lessons yet — write general product-training questions)"}

Number of questions: ${questionCount}
Passing score: 80

JSON shape:
{
  "title": string,
  "description": string,
  "passingScore": number,
  "questions": [
    {
      "question": string,
      "explanation": string,
      "options": [{ "text": string, "isCorrect": boolean }]
    }
  ]
}`;

  try {
    const { parsed, model } = await generateLocalJson({
      model: process.env.OLLAMA_MODEL || "llama3.2",
      system,
      prompt,
      temperature: 0.25,
    });

    const quiz = generatedCourseQuizSchema.parse(parsed);
    return { quiz, provider: "ollama", model };
  } catch {
    return {
      quiz: buildFallbackQuiz(input.courseTitle, input.lessons, questionCount),
      provider: "fallback",
      model: "template-fallback",
      warning:
        "AI generation failed — using a template quiz. Edit questions before saving.",
    };
  }
}

/** Map AI course draft quiz to save payload shape */
export function quizFromCourseDraft(
  draft: GeneratedCourseDraft["quiz"],
): GeneratedCourseQuiz {
  return generatedCourseQuizSchema.parse(draft);
}

import { z } from "zod";

export const generatedQuizOptionSchema = z.object({
  text: z.string().trim().min(1).max(400),
  isCorrect: z.boolean(),
});

export const generatedQuizQuestionSchema = z.object({
  question: z.string().trim().min(5).max(500),
  explanation: z.string().trim().min(5).max(800),
  options: z
    .array(generatedQuizOptionSchema)
    .min(2)
    .max(6)
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      message: "Each question must have exactly one correct option",
    }),
});

export const generatedLessonSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(800),
  learningObjective: z.string().trim().min(10).max(400),
  estimatedMinutes: z.number().int().min(2).max(120),
  writtenContent: z.string().trim().min(40).max(12000),
  /** Optional YouTube video attached to this lesson */
  youtubeVideoId: z
    .string()
    .trim()
    .regex(/^[\w-]{11}$/)
    .optional()
    .nullable(),
});

export const generatedModuleSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(5).max(500),
  lessons: z.array(generatedLessonSchema).min(1).max(12),
});

export const generatedCourseDraftSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().trim().min(10).max(300),
  description: z.string().trim().min(40).max(4000),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedMinutes: z.number().int().min(10).max(600),
  learningOutcomes: z.array(z.string().trim().min(5).max(200)).min(3).max(10),
  modules: z.array(generatedModuleSchema).min(1).max(10),
  quiz: z.object({
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().min(10).max(500),
    passingScore: z.number().int().min(50).max(100),
    questions: z.array(generatedQuizQuestionSchema).min(3).max(15),
  }),
});

export type GeneratedCourseDraft = z.infer<typeof generatedCourseDraftSchema>;

export const aiCourseGenerateInputSchema = z.object({
  /** Optional product link — leave empty for general / soft-skills courses */
  productId: z.string().trim().optional().nullable().or(z.literal("")),
  /** Free-form course name (not required to match a product) */
  courseTitle: z.string().trim().min(2).max(200).optional().nullable().or(z.literal("")),
  topic: z.string().trim().min(2, "Enter a topic (at least 2 characters)").max(500),
  audience: z.string().trim().max(200).optional().nullable(),
  moduleCount: z.coerce.number().int().min(2).max(6).default(3),
  lessonsPerModule: z.coerce.number().int().min(2).max(5).default(3),
  quizQuestionCount: z.coerce.number().int().min(3).max(15).default(5),
  youtubeUrl: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (value) => !value || value.length === 0 || /^https?:\/\//i.test(value),
      "Enter a valid YouTube URL",
    ),
  model: z.string().trim().min(1).max(120).optional().nullable(),
  useFallback: z.boolean().optional(),
});

export type AiCourseGenerateInput = z.infer<typeof aiCourseGenerateInputSchema>;

/** Demo product used when the course is not tied to a Maxpro product */
export const GENERAL_TRAINING_PRODUCT_ID =
  "11111111-1111-1111-1111-111111111199";

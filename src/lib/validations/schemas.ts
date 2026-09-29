import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const passwordResetSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(120, "Full name must be at most 120 characters"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120)
    .optional(),
  company: z.string().trim().max(120).optional().nullable(),
  jobTitle: z.string().trim().max(120).optional().nullable(),
  avatarUrl: z.string().url("Enter a valid URL").optional().nullable(),
  timezone: z.string().trim().min(1).max(80).optional().nullable(),
  locale: z.string().trim().min(2).max(20).optional().nullable(),
  learningRole: z
    .enum([
      "sales_representative",
      "sales_manager",
      "administrator",
      "operations",
      "business_owner",
      "trainer",
    ])
    .optional()
    .nullable(),
  preferredProductIds: z.array(z.string().min(1)).optional().nullable(),
});

export const courseCreateSchema = z.object({
  productId: z.string().trim().min(1, "Select a product"),
  courseKind: z.enum(["internal", "external"]).default("internal"),
  title: z.string().trim().min(3).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  description: z.string().trim().max(5000).optional().nullable(),
  shortDescription: z.string().trim().max(500).optional().nullable(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  estimatedMinutes: z.coerce.number().int().min(0).max(10000).default(0),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  certificateEnabled: z.boolean().default(true),
  learningOutcomes: z.array(z.string().trim().min(1)).max(20).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const courseUpdateSchema = courseCreateSchema
  .partial()
  .extend({
    productId: z.string().trim().min(1).optional(),
    title: z.string().trim().min(3).max(200).optional(),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
  });

const lessonVideoUrlSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine(
    (value) => {
      if (!value) return true;
      if (value.startsWith("/")) return value.length <= 2048;
      return z.string().url().safeParse(value).success;
    },
    { message: "Enter a valid URL or a site path starting with /" },
  );

export const lessonCreateSchema = z.object({
  moduleId: z.string().trim().min(1),
  title: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(2000).optional().nullable(),
  learningObjective: z.string().trim().max(1000).optional().nullable(),
  videoProvider: z
    .enum([
      "external",
      "youtube",
      "vimeo",
      "mux",
      "cloudflare",
      "placeholder",
    ])
    .default("placeholder"),
  videoId: z.string().trim().max(255).optional().nullable(),
  videoUrl: lessonVideoUrlSchema,
  durationSeconds: z.coerce.number().int().min(0).max(86400).default(0),
  writtenContent: z.string().max(50000).optional().nullable(),
  published: z.boolean().default(false),
  required: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const lessonUpdateSchema = lessonCreateSchema
  .partial()
  .extend({
    moduleId: z.string().trim().min(1).optional(),
    title: z.string().trim().min(2).max(200).optional(),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
  });

export const quizSubmitSchema = z.object({
  quizId: z.string().trim().min(1),
  answers: z.record(z.string().min(1), z.string().min(1)).refine(
    (answers) => Object.keys(answers).length > 0,
    "At least one answer is required",
  ),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  category: z.string().trim().max(120).optional().nullable(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  company: z.string().trim().max(120).optional().nullable(),
  jobTitle: z.string().trim().max(120).optional().nullable(),
  learningRole: z.enum([
    "sales_representative",
    "sales_manager",
    "administrator",
    "operations",
    "business_owner",
    "trainer",
  ]),
  preferredProductIds: z
    .array(z.string().min(1))
    .min(1, "Select at least one product"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>;
export type QuizSubmitInput = z.infer<typeof quizSubmitSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

import { z } from "zod";
import { generatedQuizQuestionSchema } from "@/lib/ai/course-schema";

export const questionnaireUploadSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(5).max(2000),
  passingScore: z.number().int().min(50).max(100),
  questions: z.array(generatedQuizQuestionSchema).min(1).max(50),
});

export type QuestionnaireUpload = z.infer<typeof questionnaireUploadSchema>;

export function parseQuestionnaireJson(raw: string): QuestionnaireUpload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON. Upload a .json questionnaire file.");
  }
  return questionnaireUploadSchema.parse(parsed);
}

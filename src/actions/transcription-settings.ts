"use server";

import { actionError, actionSuccess, type ActionResult } from "@/lib/auth/action-result";
import { requireCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";
import {
  getTranscriptionSettings,
  getTranscriptionSettingsPublic,
  saveTranscriptionSettings,
  type TranscriptionProvider,
  type TranscriptionSettingsPublic,
} from "@/lib/settings/transcription-settings";
import { z } from "zod";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (!canAccessAdmin(user.profile.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function loadTranscriptionSettings(): Promise<
  ActionResult<TranscriptionSettingsPublic>
> {
  try {
    await requireAdmin();
    const data = await getTranscriptionSettingsPublic();
    return actionSuccess(data);
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Unable to load settings",
    );
  }
}

const saveSchema = z.object({
  provider: z.enum(["openai", "gemini"]),
  autoTranscribeOnUpload: z.boolean(),
  openaiApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
});

export async function updateTranscriptionSettings(
  input: z.infer<typeof saveSchema>,
): Promise<ActionResult<TranscriptionSettingsPublic>> {
  try {
    await requireAdmin();
    const parsed = saveSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const current = await getTranscriptionSettings();
    const openaiApiKey =
      parsed.data.openaiApiKey?.trim() === ""
        ? ""
        : parsed.data.openaiApiKey?.trim() || undefined;
    const geminiApiKey =
      parsed.data.geminiApiKey?.trim() === ""
        ? ""
        : parsed.data.geminiApiKey?.trim() || undefined;

    await saveTranscriptionSettings({
      provider: parsed.data.provider as TranscriptionProvider,
      autoTranscribeOnUpload: parsed.data.autoTranscribeOnUpload,
      openaiApiKey:
        openaiApiKey !== undefined ? openaiApiKey : current.openaiApiKey,
      geminiApiKey:
        geminiApiKey !== undefined ? geminiApiKey : current.geminiApiKey,
    });

    const data = await getTranscriptionSettingsPublic();
    return actionSuccess(data);
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Unable to save settings",
    );
  }
}

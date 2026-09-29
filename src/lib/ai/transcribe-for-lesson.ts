import {
  resolveLocalVideoPathFromPublicUrl,
  transcribeVideoFile,
} from "@/lib/ai/transcribe-video";
import {
  getActiveTranscriptionApiKey,
  getTranscriptionSettings,
} from "@/lib/settings/transcription-settings";

export async function transcribeUploadedVideoUrl(
  videoUrl: string,
): Promise<string | null> {
  const settings = await getTranscriptionSettings();
  if (!settings.autoTranscribeOnUpload) {
    return null;
  }

  const active = getActiveTranscriptionApiKey(settings);
  if (!active) {
    return null;
  }

  const filePath = resolveLocalVideoPathFromPublicUrl(videoUrl);
  if (!filePath) {
    return null;
  }

  try {
    return await transcribeVideoFile({
      filePath,
      provider: active.provider,
      apiKey: active.apiKey,
    });
  } catch (error) {
    console.error("[transcribe]", error);
    return null;
  }
}

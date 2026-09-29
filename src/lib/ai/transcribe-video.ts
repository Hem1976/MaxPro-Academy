import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { TranscriptionProvider } from "@/lib/settings/transcription-settings";

const OPENAI_MAX_BYTES = 25 * 1024 * 1024;

function mimeTypeFromPath(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".m4v")) return "video/x-m4v";
  if (lower.endsWith(".ogg")) return "video/ogg";
  return "video/mp4";
}

export function resolveLocalVideoPathFromPublicUrl(
  publicUrl: string,
): string | null {
  if (!publicUrl.startsWith("/")) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(publicUrl);
    if (decoded.includes("..")) {
      return null;
    }
    return join(process.cwd(), "public", decoded.replace(/^\//, ""));
  } catch {
    return null;
  }
}

async function transcribeWithOpenAI(
  apiKey: string,
  filePath: string,
): Promise<string> {
  const bytes = await readFile(filePath);
  if (bytes.byteLength > OPENAI_MAX_BYTES) {
    throw new Error(
      "Video is over 25 MB. Use Gemini or a shorter clip for OpenAI Whisper.",
    );
  }

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([bytes], { type: mimeTypeFromPath(filePath) }),
    basename(filePath),
  );
  formData.append("model", "whisper-1");
  formData.append("response_format", "text");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      detail.slice(0, 200) || `OpenAI transcription failed (${response.status})`,
    );
  }

  const text = await response.text();
  return text.trim();
}

async function waitForGeminiFileActive(
  apiKey: string,
  fileName: string,
): Promise<{ uri: string; mimeType: string }> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const statusRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${encodeURIComponent(apiKey)}`,
    );
    if (!statusRes.ok) {
      throw new Error("Could not check Gemini file status");
    }
    const status = (await statusRes.json()) as {
      state?: string;
      uri?: string;
      mimeType?: string;
      error?: { message?: string };
    };

    if (status.state === "ACTIVE" && status.uri) {
      return {
        uri: status.uri,
        mimeType: status.mimeType ?? "video/mp4",
      };
    }
    if (status.state === "FAILED") {
      throw new Error(status.error?.message ?? "Gemini file processing failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Gemini file processing timed out");
}

async function uploadGeminiFile(
  apiKey: string,
  filePath: string,
): Promise<{ uri: string; mimeType: string }> {
  const bytes = await readFile(filePath);
  const mimeType = mimeTypeFromPath(filePath);
  const displayName = basename(filePath);

  const startResponse = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(bytes.byteLength),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: { display_name: displayName },
      }),
    },
  );

  if (!startResponse.ok) {
    throw new Error(
      `Gemini upload failed to start (${startResponse.status})`,
    );
  }

  const uploadUrl = startResponse.headers.get("x-goog-upload-url");
  if (!uploadUrl) {
    throw new Error("Gemini did not return an upload URL");
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(bytes.byteLength),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: bytes,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Gemini upload failed (${uploadResponse.status})`);
  }

  const fileInfo = (await uploadResponse.json()) as {
    file?: { name?: string; uri?: string; mimeType?: string; state?: string };
  };

  const fileName = fileInfo.file?.name;
  if (!fileName) {
    throw new Error("Gemini upload response missing file name");
  }

  if (fileInfo.file?.state === "ACTIVE" && fileInfo.file.uri) {
    return {
      uri: fileInfo.file.uri,
      mimeType: fileInfo.file.mimeType ?? mimeType,
    };
  }

  return waitForGeminiFileActive(apiKey, fileName);
}

async function transcribeWithGemini(
  apiKey: string,
  filePath: string,
): Promise<string> {
  const { uri, mimeType } = await uploadGeminiFile(apiKey, filePath);

  const generateResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  "Transcribe all spoken words in this video. Return plain transcript text only — no timestamps, labels, or markdown.",
              },
              {
                file_data: {
                  mime_type: mimeType,
                  file_uri: uri,
                },
              },
            ],
          },
        ],
      }),
    },
  );

  if (!generateResponse.ok) {
    const detail = await generateResponse.text();
    throw new Error(
      detail.slice(0, 200) ||
        `Gemini transcription failed (${generateResponse.status})`,
    );
  }

  const payload = (await generateResponse.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text =
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? "";

  if (!text) {
    throw new Error("Gemini returned an empty transcript");
  }

  return text;
}

export async function transcribeVideoFile(input: {
  filePath: string;
  provider: TranscriptionProvider;
  apiKey: string;
}): Promise<string> {
  if (input.provider === "gemini") {
    return transcribeWithGemini(input.apiKey, input.filePath);
  }
  return transcribeWithOpenAI(input.apiKey, input.filePath);
}

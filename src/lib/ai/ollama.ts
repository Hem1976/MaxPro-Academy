/**
 * Local AI client for Ollama (and OpenAI-compatible local servers).
 * Default: http://127.0.0.1:11434
 */

export interface LocalAiModel {
  name: string;
  size?: number;
  modifiedAt?: string;
}

export interface LocalAiStatus {
  available: boolean;
  baseUrl: string;
  models: LocalAiModel[];
  error?: string;
}

function getBaseUrl(): string {
  return (
    process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") ||
    process.env.LOCAL_AI_BASE_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:11434"
  );
}

export function getLocalAiBaseUrl(): string {
  return getBaseUrl();
}

export async function getLocalAiStatus(): Promise<LocalAiStatus> {
  const baseUrl = getBaseUrl();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        available: false,
        baseUrl,
        models: [],
        error: `Ollama responded with ${response.status}`,
      };
    }

    const payload = (await response.json()) as {
      models?: Array<{ name: string; size?: number; modified_at?: string }>;
    };

    const models = (payload.models ?? []).map((model) => ({
      name: model.name,
      size: model.size,
      modifiedAt: model.modified_at,
    }));

    return { available: true, baseUrl, models };
  } catch (error) {
    return {
      available: false,
      baseUrl,
      models: [],
      error:
        error instanceof Error
          ? error.message
          : "Unable to reach local AI server",
    };
  }
}

export async function listLocalAiModels(): Promise<LocalAiModel[]> {
  const status = await getLocalAiStatus();
  return status.models;
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim());
    }

    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }

    throw new Error("Model response did not contain valid JSON");
  }
}

export async function generateLocalJson(input: {
  model: string;
  system: string;
  prompt: string;
  temperature?: number;
}): Promise<{ raw: string; parsed: unknown; model: string }> {
  const baseUrl = getBaseUrl();
  const model = input.model || process.env.OLLAMA_MODEL || "llama3.2";

  const controller = new AbortController();
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS ?? 180_000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        options: {
          temperature: input.temperature ?? 0.3,
        },
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.prompt },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Local AI request failed (${response.status}): ${body.slice(0, 240)}`,
      );
    }

    const payload = (await response.json()) as {
      message?: { content?: string };
      response?: string;
    };

    const raw =
      payload.message?.content?.trim() ||
      payload.response?.trim() ||
      "";

    if (!raw) {
      throw new Error("Local AI returned an empty response");
    }

    return {
      raw,
      parsed: extractJsonObject(raw),
      model,
    };
  } finally {
    clearTimeout(timeout);
  }
}

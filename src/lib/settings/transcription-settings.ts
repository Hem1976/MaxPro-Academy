import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type TranscriptionProvider = "openai" | "gemini";

export interface TranscriptionSettings {
  provider: TranscriptionProvider;
  openaiApiKey: string;
  geminiApiKey: string;
  autoTranscribeOnUpload: boolean;
}

export interface TranscriptionSettingsPublic {
  provider: TranscriptionProvider;
  autoTranscribeOnUpload: boolean;
  openaiConfigured: boolean;
  geminiConfigured: boolean;
  openaiMasked: string | null;
  geminiMasked: string | null;
}

const SETTINGS_PATH = join(process.cwd(), ".data", "transcription-settings.json");

const DEFAULTS: TranscriptionSettings = {
  provider: "openai",
  openaiApiKey: "",
  geminiApiKey: "",
  autoTranscribeOnUpload: true,
};

function maskApiKey(key: string): string | null {
  const trimmed = key.trim();
  if (!trimmed) return null;
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

function envFallback(): Partial<TranscriptionSettings> {
  const provider = process.env.TRANSCRIPTION_PROVIDER?.trim();
  return {
    provider:
      provider === "gemini" || provider === "openai"
        ? provider
        : undefined,
    openaiApiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
    geminiApiKey:
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
      "",
  };
}

function mergeSettings(
  stored: Partial<TranscriptionSettings> | null,
): TranscriptionSettings {
  const env = envFallback();
  const base = { ...DEFAULTS, ...env, ...stored };
  return {
    provider: base.provider === "gemini" ? "gemini" : "openai",
    openaiApiKey: base.openaiApiKey?.trim() ?? "",
    geminiApiKey: base.geminiApiKey?.trim() ?? "",
    autoTranscribeOnUpload: base.autoTranscribeOnUpload ?? true,
  };
}

async function readStoredFile(): Promise<Partial<TranscriptionSettings> | null> {
  try {
    const raw = await readFile(SETTINGS_PATH, "utf8");
    return JSON.parse(raw) as Partial<TranscriptionSettings>;
  } catch {
    return null;
  }
}

export async function getTranscriptionSettings(): Promise<TranscriptionSettings> {
  const stored = await readStoredFile();
  return mergeSettings(stored);
}

export async function getTranscriptionSettingsPublic(): Promise<TranscriptionSettingsPublic> {
  const settings = await getTranscriptionSettings();
  return {
    provider: settings.provider,
    autoTranscribeOnUpload: settings.autoTranscribeOnUpload,
    openaiConfigured: Boolean(settings.openaiApiKey),
    geminiConfigured: Boolean(settings.geminiApiKey),
    openaiMasked: maskApiKey(settings.openaiApiKey),
    geminiMasked: maskApiKey(settings.geminiApiKey),
  };
}

export async function saveTranscriptionSettings(
  input: Partial<TranscriptionSettings> & {
    openaiApiKey?: string;
    geminiApiKey?: string;
  },
): Promise<TranscriptionSettings> {
  const current = await getTranscriptionSettings();

  const next: TranscriptionSettings = {
    provider:
      input.provider === "gemini" || input.provider === "openai"
        ? input.provider
        : current.provider,
    autoTranscribeOnUpload:
      input.autoTranscribeOnUpload ?? current.autoTranscribeOnUpload,
    openaiApiKey:
      input.openaiApiKey !== undefined
        ? input.openaiApiKey.trim()
        : current.openaiApiKey,
    geminiApiKey:
      input.geminiApiKey !== undefined
        ? input.geminiApiKey.trim()
        : current.geminiApiKey,
  };

  await mkdir(join(process.cwd(), ".data"), { recursive: true });
  await writeFile(SETTINGS_PATH, JSON.stringify(next, null, 2), "utf8");

  return next;
}

export function getActiveTranscriptionApiKey(
  settings: TranscriptionSettings,
): { provider: TranscriptionProvider; apiKey: string } | null {
  const provider = settings.provider;
  const apiKey =
    provider === "gemini"
      ? settings.geminiApiKey
      : settings.openaiApiKey;

  if (!apiKey.trim()) {
    return null;
  }

  return { provider, apiKey: apiKey.trim() };
}

export function isTranscriptionConfigured(
  settings: TranscriptionSettings,
): boolean {
  return getActiveTranscriptionApiKey(settings) !== null;
}

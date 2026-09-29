"use client";

import { useEffect, useState, useTransition } from "react";
import {
  loadTranscriptionSettings,
  updateTranscriptionSettings,
} from "@/actions/transcription-settings";
import type { TranscriptionSettingsPublic } from "@/lib/settings/transcription-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function TranscriptionSettingsForm() {
  const [settings, setSettings] = useState<TranscriptionSettingsPublic | null>(
    null,
  );
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await loadTranscriptionSettings();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSettings(result.data);
      setProvider(result.data.provider);
      setAutoTranscribe(result.data.autoTranscribeOnUpload);
    });
  }, []);

  const save = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateTranscriptionSettings({
        provider,
        autoTranscribeOnUpload: autoTranscribe,
        openaiApiKey: openaiKey || undefined,
        geminiApiKey: geminiKey || undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSettings(result.data);
      setOpenaiKey("");
      setGeminiKey("");
      setMessage("Saved. New uploads will use these settings.");
    });
  };

  const activeReady =
    provider === "openai"
      ? settings?.openaiConfigured || openaiKey.trim().length > 0
      : settings?.geminiConfigured || geminiKey.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="transcription-provider">Use for transcription</Label>
        <Select
          id="transcription-provider"
          value={provider}
          onChange={(event) =>
            setProvider(event.target.value as "openai" | "gemini")
          }
        >
          <option value="openai">OpenAI (Whisper)</option>
          <option value="gemini">Google Gemini</option>
        </Select>
        <p className="text-xs text-muted-foreground">
          Pick which API runs when videos are transcribed.
          {!activeReady ? " Add the matching API key below." : null}
        </p>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={autoTranscribe}
          onChange={(event) => setAutoTranscribe(event.target.checked)}
        />
        <span>
          <span className="font-medium text-foreground">
            Transcribe uploaded videos
          </span>
          <span className="block text-muted-foreground">
            When you save lessons from the course video uploader, fill in
            lesson transcripts automatically.
          </span>
        </span>
      </label>

      <div className="space-y-2">
        <Label htmlFor="openai-api-key">OpenAI API key</Label>
        <Input
          id="openai-api-key"
          type="password"
          autoComplete="off"
          placeholder={
            settings?.openaiMasked
              ? `Saved (${settings.openaiMasked}) — paste to replace`
              : "sk-…"
          }
          value={openaiKey}
          onChange={(event) => setOpenaiKey(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Used when OpenAI is selected. Best for files under 25 MB.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gemini-api-key">Gemini API key</Label>
        <Input
          id="gemini-api-key"
          type="password"
          autoComplete="off"
          placeholder={
            settings?.geminiMasked
              ? `Saved (${settings.geminiMasked}) — paste to replace`
              : "AIza…"
          }
          value={geminiKey}
          onChange={(event) => setGeminiKey(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Used when Gemini is selected. Better for longer videos.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Keys are stored on the server only (not in the browser). You can also
        set{" "}
        <code className="rounded bg-surface px-1">OPENAI_API_KEY</code> or{" "}
        <code className="rounded bg-surface px-1">GEMINI_API_KEY</code> in{" "}
        <code className="rounded bg-surface px-1">.env.local</code>.
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-success">{message}</p> : null}

      <Button type="button" onClick={save} disabled={pending}>
        {pending ? "Saving…" : "Save transcription settings"}
      </Button>
    </div>
  );
}

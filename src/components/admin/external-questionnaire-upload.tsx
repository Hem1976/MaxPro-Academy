"use client";

import { useState, useTransition } from "react";
import { FileUp } from "lucide-react";
import { importExternalQuestionnaire } from "@/actions/course-content";
import { Label } from "@/components/ui/label";

interface ExternalQuestionnaireUploadProps {
  courseId: string;
  hasExistingQuiz: boolean;
}

export function ExternalQuestionnaireUpload({
  courseId,
  hasExistingQuiz,
}: ExternalQuestionnaireUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFile = (file: File) => {
    setError(null);
    setSuccess(null);

    if (!file.name.toLowerCase().endsWith(".json")) {
      setError("Upload a .json questionnaire file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      startTransition(async () => {
        const result = await importExternalQuestionnaire({
          courseId,
          questionnaireJson: text,
          replaceExisting,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        setSuccess(
          `Questionnaire saved (${result.data.title}). Learners can take it from the course quiz page.`,
        );
        window.location.reload();
      });
    };
    reader.onerror = () => setError("Could not read the file.");
    reader.readAsText(file);
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <FileUp className="mt-0.5 size-5 text-accent" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-foreground">
            Upload questionnaire
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            External courses are completed by passing an uploaded quiz. Use JSON
            with a title, description, passing score, and questions (each with
            exactly one correct option).
          </p>
          <p className="mt-2 text-sm">
            <a
              href="/templates/external-questionnaire.json"
              className="font-medium text-accent hover:underline"
              download
            >
              Download sample JSON template
            </a>
          </p>
        </div>
      </div>

      {hasExistingQuiz && (
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={replaceExisting}
            onChange={(event) => setReplaceExisting(event.target.checked)}
          />
          Replace existing questionnaire
        </label>
      )}

      <div className="mt-4">
        <Label className="sr-only">Questionnaire file</Label>
        <label
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center hover:bg-surface"
        >
          <FileUp className="mb-2 size-8 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Choose questionnaire (.json)
          </span>
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            disabled={isPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-700">{success}</p>}
    </section>
  );
}

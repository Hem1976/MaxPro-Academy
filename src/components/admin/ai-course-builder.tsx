"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  generateAiCourseDraft,
  getAiCourseBuilderStatus,
  publishAiCourseDraft,
} from "@/actions/ai-course";
import type { GeneratedCourseDraft } from "@/lib/ai/course-schema";
import type { Product } from "@/types/database";
import { Button } from "@/components/ui/button";

interface AiCourseBuilderProps {
  products: Product[];
}

export function AiCourseBuilder({ products }: AiCourseBuilderProps) {
  const [productId, setProductId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("Sales representatives and supervisors");
  const [moduleCount, setModuleCount] = useState(3);
  const [lessonsPerModule, setLessonsPerModule] = useState(3);
  const [quizQuestionCount, setQuizQuestionCount] = useState(5);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [model, setModel] = useState("");
  const [forceFallback, setForceFallback] = useState(false);
  const [publishNow, setPublishNow] = useState(true);

  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [baseUrl, setBaseUrl] = useState("http://127.0.0.1:11434");

  const [draft, setDraft] = useState<GeneratedCourseDraft | null>(null);
  const [resolvedProductId, setResolvedProductId] = useState<string>("");
  const [provider, setProvider] = useState<"ollama" | "fallback" | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successHref, setSuccessHref] = useState<string | null>(null);
  const [youtubeVideoCount, setYoutubeVideoCount] = useState(0);
  const [youtubePlaylistTitle, setYoutubePlaylistTitle] = useState<
    string | null
  >(null);

  const [pending, startTransition] = useTransition();

  const canGenerate = topic.trim().length >= 2;
  const lessonCount = useMemo(() => {
    if (!draft) return 0;
    return draft.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  }, [draft]);

  useEffect(() => {
    startTransition(async () => {
      const result = await getAiCourseBuilderStatus();
      if (!result.success) {
        setAiAvailable(false);
        setAiError(result.error);
        return;
      }

      setAiAvailable(result.data.available);
      setAiError(result.data.error ?? null);
      setBaseUrl(result.data.baseUrl);
      const names = result.data.models.map((item) => item.name);
      setModels(names);
      if (names[0] && !model) {
        setModel(names[0]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshStatus() {
    startTransition(async () => {
      const result = await getAiCourseBuilderStatus();
      if (!result.success) {
        setAiAvailable(false);
        setAiError(result.error);
        return;
      }
      setAiAvailable(result.data.available);
      setAiError(result.data.error ?? null);
      setBaseUrl(result.data.baseUrl);
      const names = result.data.models.map((item) => item.name);
      setModels(names);
      if (names[0]) setModel(names[0]);
    });
  }

  function onGenerate() {
    setError(null);
    setSuccessHref(null);
    setWarning(null);

    if (!canGenerate) {
      setError("Enter a topic (at least 2 characters) before generating.");
      return;
    }

    startTransition(async () => {
      const result = await generateAiCourseDraft({
        productId: productId || null,
        courseTitle: courseTitle || null,
        topic,
        audience,
        moduleCount,
        lessonsPerModule,
        quizQuestionCount,
        youtubeUrl: youtubeUrl || null,
        model: model || null,
        useFallback: forceFallback,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setDraft(result.data.draft);
      setResolvedProductId(result.data.productId);
      setProvider(result.data.provider);
      setUsedModel(result.data.model);
      setWarning(result.data.warning ?? null);
      setYoutubeVideoCount(result.data.youtubeVideoCount ?? 0);
      setYoutubePlaylistTitle(result.data.youtubePlaylistTitle ?? null);
    });
  }

  function onPublish() {
    if (!draft) return;
    setError(null);

    startTransition(async () => {
      const result = await publishAiCourseDraft({
        productId: resolvedProductId || productId || null,
        draft,
        publishNow,
        youtubeUrl: youtubeUrl || null,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccessHref(`/admin/courses/${result.data.courseId}`);
    });
  }

  function updateDraftField<K extends keyof GeneratedCourseDraft>(
    key: K,
    value: GeneratedCourseDraft[K],
  ) {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Sparkles className="size-4 text-accent" aria-hidden="true" />
              AI connection
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ollama at <span className="font-mono text-xs">{baseUrl}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshStatus} disabled={pending}>
            Refresh
          </Button>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-md border border-border bg-surface/60 p-3 text-sm">
          {aiAvailable === null ? (
            <>
              <Loader2 className="mt-0.5 size-4 animate-spin text-muted-foreground" />
              <p>Checking AI…</p>
            </>
          ) : aiAvailable ? (
            <>
              <CheckCircle2 className="mt-0.5 size-4 text-success" />
              <div>
                <p className="font-medium text-foreground">Connected</p>
                <p className="text-muted-foreground">
                  {models.length} model{models.length === 1 ? "" : "s"}
                  {models[0] ? ` · using ${models[0]}` : ""}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="mt-0.5 size-4 text-warning" />
              <div>
                <p className="font-medium text-foreground">
                  AI off — sample template will be used
                </p>
                <p className="text-muted-foreground">
                  {aiError ?? "Start Ollama, then: ollama pull llama3.2"}
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">1. What to build</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us the topic. AI writes the outline, lessons, and quiz.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium text-foreground">
              Course title
            </span>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={courseTitle}
              onChange={(event) => setCourseTitle(event.target.value)}
              placeholder="e.g. Sales basics"
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Any name you like.
            </span>
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium text-foreground">
              Topic
            </span>
            <textarea
              className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="What should learners learn?"
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium text-foreground">
              Solution (optional)
            </span>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
            >
              <option value="">None</option>
              {products
                .filter((product) => product.slug !== "general-training")
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                    {!product.published ? " (hidden)" : ""}
                  </option>
                ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Audience</span>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">
              YouTube URL (optional)
            </span>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="https://youtu.be/..."
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Playlist or single video — each becomes a lesson.
            </span>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Modules</span>
            <input
              type="number"
              min={2}
              max={6}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={moduleCount}
              onChange={(event) => setModuleCount(Number(event.target.value))}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">
              Lessons per module
            </span>
            <input
              type="number"
              min={2}
              max={5}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={lessonsPerModule}
              onChange={(event) =>
                setLessonsPerModule(Number(event.target.value))
              }
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">
              Quiz questions
            </span>
            <input
              type="number"
              min={3}
              max={15}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={quizQuestionCount}
              onChange={(event) =>
                setQuizQuestionCount(Number(event.target.value))
              }
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">
              AI model
            </span>
            {models.length > 0 ? (
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2"
                value={model}
                onChange={(event) => setModel(event.target.value)}
              >
                {models.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-2"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="llama3.2"
              />
            )}
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(event) => setForceFallback(event.target.checked)}
            />
            Use template only (skip AI)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={publishNow}
              onChange={(event) => setPublishNow(event.target.checked)}
            />
            Publish when saving
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button onClick={onGenerate} disabled={pending || !canGenerate}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Wand2 className="size-4" aria-hidden="true" />
            )}
            Generate draft
          </Button>
          {!canGenerate && (
            <p className="text-sm text-muted-foreground">
              Add a topic (2+ letters) to continue.
            </p>
          )}
          {pending && (
            <p className="text-sm text-muted-foreground">
              This may take a few minutes.
            </p>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {warning && (
        <div className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
          {warning}
        </div>
      )}

      {successHref && (
        <div className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Course saved.{" "}
          <Link href={successHref} className="font-medium underline">
            Open course
          </Link>
        </div>
      )}

      {draft && (
        <section className="space-y-5 rounded-lg border border-border bg-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                2. Check draft
              </h2>
              <p className="text-sm text-muted-foreground">
                Provider: {provider} · Model: {usedModel} · {draft.modules.length}{" "}
                modules · {lessonCount} lessons · {draft.quiz.questions.length}{" "}
                quiz questions
                {youtubeVideoCount > 0
                  ? ` · ${youtubeVideoCount} YouTube video${
                      youtubeVideoCount === 1 ? "" : "s"
                    } mapped${
                      youtubePlaylistTitle ? ` (${youtubePlaylistTitle})` : ""
                    }`
                  : ""}
              </p>
            </div>
            <Button onClick={onPublish} disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              Save course
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1.5 block font-medium">Title</span>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-2"
                value={draft.title}
                onChange={(event) =>
                  updateDraftField("title", event.target.value)
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Slug</span>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
                value={draft.slug}
                onChange={(event) =>
                  updateDraftField("slug", event.target.value)
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Level</span>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2"
                value={draft.level}
                onChange={(event) =>
                  updateDraftField(
                    "level",
                    event.target.value as GeneratedCourseDraft["level"],
                  )
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1.5 block font-medium">Short description</span>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-2"
                value={draft.shortDescription}
                onChange={(event) =>
                  updateDraftField("shortDescription", event.target.value)
                }
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1.5 block font-medium">Description</span>
              <textarea
                className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2"
                value={draft.description}
                onChange={(event) =>
                  updateDraftField("description", event.target.value)
                }
              />
            </label>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Learning outcomes
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {draft.learningOutcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Modules & lessons</h3>
            {draft.modules.map((courseModule, moduleIndex) => (
              <div
                key={`${courseModule.title}-${moduleIndex}`}
                className="rounded-md border border-border bg-surface/40 p-4"
              >
                <p className="font-medium text-foreground">
                  {moduleIndex + 1}. {courseModule.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {courseModule.description}
                </p>
                <ul className="mt-3 space-y-2">
                  {courseModule.lessons.map((lesson, lessonIndex) => (
                    <li
                      key={`${lesson.slug}-${lessonIndex}`}
                      className="rounded-md border border-border bg-card px-3 py-2"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {lesson.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {lesson.estimatedMinutes} min · {lesson.learningObjective}
                      </p>
                      {lesson.youtubeVideoId ? (
                        <p className="mt-1 font-mono text-[11px] text-accent">
                          YouTube: {lesson.youtubeVideoId}
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-warning">
                          No video attached
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Final quiz · {draft.quiz.passingScore}% to pass
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {draft.quiz.title} — {draft.quiz.description}
            </p>
            <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm">
              {draft.quiz.questions.map((question, index) => (
                <li key={`${question.question}-${index}`}>
                  <p className="font-medium text-foreground">{question.question}</p>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {question.options.map((option) => (
                      <li key={option.text}>
                        {option.isCorrect ? "✓ " : "• "}
                        {option.text}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}

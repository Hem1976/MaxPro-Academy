"use client";

import { useMemo, useState, useTransition } from "react";
import { Film, Upload } from "lucide-react";
import { createVideoLessons } from "@/actions/course-content";
import { ModuleForm } from "@/components/admin/module-form";
import { QuizBuilderForm } from "@/components/admin/quiz-builder-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { slugify } from "@/lib/utils";
import type { Course, Module } from "@/types/database";

export interface PendingVideoLesson {
  id: string;
  fileName: string;
  title: string;
  slug: string;
  videoUrl: string;
  moduleId: string;
  status: "uploading" | "ready" | "error";
  error?: string;
}

interface VideoCourseBuilderProps {
  course: Course;
  modules: Module[];
  nextModuleSortOrder: number;
  hasExistingQuiz: boolean;
  lessonCount: number;
}

function titleFromFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function VideoCourseBuilder({
  course,
  modules,
  nextModuleSortOrder,
  hasExistingQuiz,
  lessonCount,
}: VideoCourseBuilderProps) {
  const defaultModuleId = modules[0]?.id ?? "";
  const [rows, setRows] = useState<PendingVideoLesson[]>([]);
  const [moduleMode, setModuleMode] = useState<"existing" | "new">(
    modules.length > 0 ? "existing" : "new",
  );
  const [targetModuleId, setTargetModuleId] = useState(defaultModuleId);
  const [newModuleTitle, setNewModuleTitle] = useState("Video tutorials");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [uploading, setUploading] = useState(false);

  const readyRows = useMemo(
    () => rows.filter((row) => row.status === "ready"),
    [rows],
  );

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    setError(null);
    setSuccess(null);
    setUploading(true);

    for (const file of list) {
      const rowId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const suggestedTitle = titleFromFileName(file.name);
      setRows((current) => [
        ...current,
        {
          id: rowId,
          fileName: file.name,
          title: suggestedTitle,
          slug: slugify(suggestedTitle),
          videoUrl: "",
          moduleId: targetModuleId,
          status: "uploading",
        },
      ]);

      try {
        const body = new FormData();
        body.set("courseId", course.id);
        body.set("file", file);

        const response = await fetch("/api/admin/videos/upload", {
          method: "POST",
          body,
        });
        const payload = (await response.json()) as {
          publicUrl?: string;
          suggestedTitle?: string;
          suggestedSlug?: string;
          error?: string;
        };

        if (!response.ok || !payload.publicUrl) {
          throw new Error(payload.error ?? "Upload failed");
        }

        setRows((current) =>
          current.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  status: "ready",
                  videoUrl: payload.publicUrl!,
                  title: payload.suggestedTitle ?? row.title,
                  slug: payload.suggestedSlug ?? row.slug,
                }
              : row,
          ),
        );
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Upload failed";
        setRows((current) =>
          current.map((row) =>
            row.id === rowId
              ? { ...row, status: "error", error: message }
              : row,
          ),
        );
      }
    }

    setUploading(false);
  };

  const updateRow = (id: string, updates: Partial<PendingVideoLesson>) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...updates } : row)),
    );
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
  };

  const saveLessons = () => {
    setError(null);
    setSuccess(null);

    if (moduleMode === "existing" && !targetModuleId) {
      setError("Select a module or create a new one.");
      return;
    }

    if (moduleMode === "new" && !newModuleTitle.trim()) {
      setError("Enter a name for the new module.");
      return;
    }

    if (readyRows.length === 0) {
      setError("Upload at least one video first.");
      return;
    }

    startSave(async () => {
      const result = await createVideoLessons({
        courseId: course.id,
        newModule:
          moduleMode === "new"
            ? { title: newModuleTitle.trim() }
            : undefined,
        lessons: readyRows.map((row) => ({
          moduleId:
            moduleMode === "new"
              ? undefined
              : row.moduleId || targetModuleId || defaultModuleId,
          title: row.title.trim(),
          slug: slugify(row.slug || row.title),
          videoUrl: row.videoUrl,
          published: true,
        })),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(
        `Created ${result.data.lessons.length} lesson(s)${
          result.data.module ? ` in module “${result.data.module.title}”` : ""
        }.`,
      );
      setRows([]);
      window.location.reload();
    });
  };

  return (
    <div className="space-y-10">
      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-start gap-3">
          <Film className="mt-0.5 size-5 text-accent" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              Upload video lessons
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add MP4 (or WebM/MOV) files like the Rockey tutorial library.
              Name each lesson and optionally group them into modules before
              publishing.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <Label>Module grouping</Label>
            <Select
              value={moduleMode}
              onChange={(event) =>
                setModuleMode(event.target.value as "existing" | "new")
              }
            >
              <option value="existing" disabled={modules.length === 0}>
                Add to existing module
              </option>
              <option value="new">Create new module for these videos</option>
            </Select>

            {moduleMode === "existing" ? (
              <Select
                value={targetModuleId}
                onChange={(event) => setTargetModuleId(event.target.value)}
              >
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                value={newModuleTitle}
                onChange={(event) => setNewModuleTitle(event.target.value)}
                placeholder="Module title (e.g. Day 1 — Field basics)"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Video files</Label>
            <label
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center hover:bg-surface"
            >
              <Upload className="mb-2 size-8 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Choose videos or drag files here
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                Up to 500 MB each · MP4 recommended
              </span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov,.m4v"
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={(event) => {
                  if (event.target.files) {
                    void uploadFiles(event.target.files);
                    event.target.value = "";
                  }
                }}
              />
            </label>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-2 pr-3">File</th>
                  <th className="py-2 pr-3">Lesson title</th>
                  <th className="py-2 pr-3">Slug</th>
                  {moduleMode === "existing" && modules.length > 1 && (
                    <th className="py-2 pr-3">Module</th>
                  )}
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="py-2 pr-3 align-top text-muted-foreground">
                      {row.fileName}
                    </td>
                    <td className="py-2 pr-3 align-top">
                      <Input
                        value={row.title}
                        disabled={row.status !== "ready"}
                        onChange={(event) =>
                          updateRow(row.id, {
                            title: event.target.value,
                            slug: slugify(event.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="py-2 pr-3 align-top">
                      <Input
                        value={row.slug}
                        disabled={row.status !== "ready"}
                        onChange={(event) =>
                          updateRow(row.id, { slug: event.target.value })
                        }
                      />
                    </td>
                    {moduleMode === "existing" && modules.length > 1 && (
                      <td className="py-2 pr-3 align-top">
                        <Select
                          value={row.moduleId || targetModuleId}
                          disabled={row.status !== "ready"}
                          onChange={(event) =>
                            updateRow(row.id, { moduleId: event.target.value })
                          }
                        >
                          {modules.map((module) => (
                            <option key={module.id} value={module.id}>
                              {module.title}
                            </option>
                          ))}
                        </Select>
                      </td>
                    )}
                    <td className="py-2 pr-3 align-top">
                      {row.status === "uploading" && "Uploading…"}
                      {row.status === "ready" && (
                        <span className="text-green-700">Ready</span>
                      )}
                      {row.status === "error" && (
                        <span className="text-destructive">{row.error}</span>
                      )}
                    </td>
                    <td className="py-2 align-top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(row.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        {success && <p className="mt-4 text-sm text-green-700">{success}</p>}

        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            onClick={saveLessons}
            disabled={isSaving || uploading || readyRows.length === 0}
          >
            {isSaving ? "Creating lessons…" : "Create video lessons"}
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold text-foreground">Modules</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add another module if you want to split videos across sections (for
          example by day or topic).
        </p>
        <div className="mt-4">
          <ModuleForm courseId={course.id} nextSortOrder={nextModuleSortOrder} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold text-foreground">Course quiz</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Build a final knowledge check manually or generate one with local AI
          (Ollama). The quiz is attached to the last lesson in the course.
        </p>
        <div className="mt-4">
          <QuizBuilderForm
            courseId={course.id}
            hasExistingQuiz={hasExistingQuiz}
            lessonCount={lessonCount}
          />
        </div>
      </section>
    </div>
  );
}

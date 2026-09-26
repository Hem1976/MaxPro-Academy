"use client";

import { useState, useTransition } from "react";
import { createLesson, updateLesson } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Lesson, Module } from "@/types/database";

interface LessonFormProps {
  lesson?: Lesson;
  modules: Module[];
  defaultModuleId?: string;
}

export function LessonForm({ lesson, modules, defaultModuleId }: LessonFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = lesson
        ? await updateLesson(lesson.id, formData)
        : await createLesson(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      window.location.href = `/admin/lessons/${result.data.id}`;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="moduleId">Module</Label>
        <Select
          id="moduleId"
          name="moduleId"
          defaultValue={lesson?.module_id ?? defaultModuleId ?? modules[0]?.id}
          required
        >
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={lesson?.title} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={lesson?.slug} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={lesson?.description ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="learningObjective">Learning objective</Label>
        <Input
          id="learningObjective"
          name="learningObjective"
          defaultValue={lesson?.learning_objective ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="videoProvider">Video provider</Label>
          <Select
            id="videoProvider"
            name="videoProvider"
            defaultValue={lesson?.video_provider ?? "placeholder"}
          >
            <option value="placeholder">Placeholder</option>
            <option value="external">External</option>
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationSeconds">Duration (seconds)</Label>
          <Input
            id="durationSeconds"
            name="durationSeconds"
            type="number"
            defaultValue={lesson?.duration_seconds ?? 300}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">Video URL</Label>
        <Input
          id="videoUrl"
          name="videoUrl"
          defaultValue={lesson?.video_url ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="writtenContent">Written content (Markdown)</Label>
        <Textarea
          id="writtenContent"
          name="writtenContent"
          rows={12}
          className="font-mono text-xs"
          defaultValue={lesson?.written_content ?? ""}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={lesson?.published ?? false}
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="required"
            value="true"
            defaultChecked={lesson?.required ?? true}
          />
          Required
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : lesson ? "Update lesson" : "Create lesson"}
      </Button>
    </form>
  );
}

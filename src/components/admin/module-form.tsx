"use client";

import { useState, useTransition } from "react";
import { createModule } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ModuleFormProps {
  courseId: string;
  nextSortOrder: number;
}

export function ModuleForm({ courseId, nextSortOrder }: ModuleFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set("courseId", courseId);
    formData.set("sortOrder", String(nextSortOrder));

    startTransition(async () => {
      const result = await createModule(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-foreground">Add module</h3>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Adding..." : "Add module"}
      </Button>
    </form>
  );
}

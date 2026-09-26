"use client";

import { useState, useTransition } from "react";
import { removeAnnouncement, saveAnnouncement } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Announcement } from "@/types/database";

interface AnnouncementFormProps {
  announcement?: Announcement;
}

export function AnnouncementForm({ announcement }: AnnouncementFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    if (announcement) formData.set("id", announcement.id);

    startTransition(async () => {
      const result = await saveAnnouncement(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  };

  const handleDelete = () => {
    if (!announcement) return;
    if (!window.confirm("Delete this announcement?")) return;

    startTransition(async () => {
      const result = await removeAnnouncement(announcement.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={announcement?.title}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          rows={4}
          defaultValue={announcement?.content}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Input
          id="type"
          name="type"
          defaultValue={announcement?.type ?? "info"}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          value="true"
          defaultChecked={announcement?.published ?? true}
        />
        Published
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {announcement ? "Update" : "Create"}
        </Button>
        {announcement && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}

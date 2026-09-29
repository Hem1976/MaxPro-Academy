"use client";

import { useState, useTransition } from "react";
import { publishCourse } from "@/actions/admin";
import { Button } from "@/components/ui/button";

interface PublishCourseButtonProps {
  courseId: string;
  isPublished: boolean;
}

export function PublishCourseButton({
  courseId,
  isPublished,
}: PublishCourseButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePublish = () => {
    const confirmed = window.confirm(
      "Publish this course? Learners will see it on the site.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await publishCourse(courseId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  };

  if (isPublished) {
    return (
      <p className="text-sm text-success">Published.</p>
    );
  }

  return (
    <div>
      <Button size="md" onClick={handlePublish} disabled={isPending}>
        {isPending ? "Publishing..." : "Publish course"}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <p className="mt-2 text-xs text-muted-foreground">
        Learners can find this course after you publish.
      </p>
    </div>
  );
}

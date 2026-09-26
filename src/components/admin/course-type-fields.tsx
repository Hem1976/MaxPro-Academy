"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Course } from "@/types/database";
import { getCourseKind } from "@/lib/courses/kind";

interface CourseTypeFieldsProps {
  course?: Course;
}

export function CourseTypeFields({ course }: CourseTypeFieldsProps) {
  const [kind, setKind] = useState(getCourseKind(course ?? {}));

  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-4">
      <Label htmlFor="courseKind">Course type</Label>
      <Select
        id="courseKind"
        name="courseKind"
        value={kind}
        onChange={(event) =>
          setKind(event.target.value as "internal" | "external")
        }
      >
        <option value="internal">Internal — lessons, videos, and quizzes</option>
        <option value="external">External — questionnaire / quiz upload</option>
      </Select>
      <p className="text-xs text-muted-foreground">
        {kind === "internal"
          ? "Build content with modules, video uploads, and AI or manual quizzes."
          : "Learners complete an uploaded questionnaire. Use Content → Questionnaire after saving."}
      </p>
    </div>
  );
}

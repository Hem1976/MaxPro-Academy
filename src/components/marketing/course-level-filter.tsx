"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import type { CourseLevel } from "@/types/database";

const LEVELS: { value: CourseLevel | ""; label: string }[] = [
  { value: "", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function CourseLevelFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLevel = searchParams.get("level") ?? "";

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("level", value);
    } else {
      params.delete("level");
    }

    const query = params.toString();
    router.push(query ? `/courses?${query}` : "/courses");
  };

  return (
    <div className="w-full sm:w-48">
      <label htmlFor="level-filter" className="sr-only">
        Filter by level
      </label>
      <Select
        id="level-filter"
        value={currentLevel}
        onChange={handleChange}
        aria-label="Filter by level"
      >
        {LEVELS.map((level) => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

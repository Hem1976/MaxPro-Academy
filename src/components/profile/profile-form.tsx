"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/actions/profile";
import { LEARNING_ROLES } from "@/lib/constants/learning-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Profile } from "@/types/database";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage("Profile updated successfully.");
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={profile.full_name ?? ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          name="company"
          defaultValue={profile.company ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobTitle">Job title</Label>
        <Input
          id="jobTitle"
          name="jobTitle"
          defaultValue={profile.job_title ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="learningRole">Learning role</Label>
        <Select
          id="learningRole"
          name="learningRole"
          defaultValue={profile.learning_role ?? ""}
        >
          <option value="">Select a role</option>
          {LEARNING_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}
      {message && (
        <p className="text-sm text-success" role="status">{message}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}

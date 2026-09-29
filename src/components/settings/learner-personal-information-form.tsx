"use client";

import { useRef, useState, useTransition } from "react";
import { updateProfile } from "@/actions/profile";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  DEFAULT_PROFILE_LOCALE,
  DEFAULT_PROFILE_TIMEZONE,
  PROFILE_LOCALES,
  PROFILE_TIMEZONES,
} from "@/lib/constants/profile-preferences";
import type { Profile } from "@/types/database";

const AVATAR_MAX_BYTES = 1024 * 1024;
const AVATAR_ACCEPT = "image/jpeg,image/png,image/gif";

interface LearnerPersonalInformationFormProps {
  profile: Profile;
  email: string;
}

export function LearnerPersonalInformationForm({
  profile,
  email,
}: LearnerPersonalInformationFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url,
  );
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName =
    profile.full_name?.trim() || email.split("@")[0] || "Learner";

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    if (!file) return;

    if (!AVATAR_ACCEPT.split(",").includes(file.type)) {
      setError("Use JPG, GIF, or PNG for your profile photo.");
      event.target.value = "";
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError("Profile photo must be 1MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      formData.set("avatar", file);
    }

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage("Personal information saved.");
        if (result.data.avatar_url) {
          setAvatarPreview(result.data.avatar_url);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={profile.full_name ?? ""}
          required
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          readOnly
          className="bg-muted/40"
          aria-describedby="email-hint"
        />
        <p id="email-hint" className="text-xs text-muted-foreground">
          Sign-in email is managed by your administrator. Contact support to change it.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            id="timezone"
            name="timezone"
            defaultValue={profile.timezone ?? DEFAULT_PROFILE_TIMEZONE}
          >
            {PROFILE_TIMEZONES.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locale">Language</Label>
          <Select
            id="locale"
            name="locale"
            defaultValue={profile.locale ?? DEFAULT_PROFILE_LOCALE}
          >
            {PROFILE_LOCALES.map((locale) => (
              <option key={locale.value} value={locale.value}>
                {locale.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="avatar">Profile photo</Label>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar
            src={avatarPreview}
            name={displayName}
            className="size-16 text-lg"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <Input
              ref={fileInputRef}
              id="avatar"
              name="avatar"
              type="file"
              accept={AVATAR_ACCEPT}
              onChange={handleAvatarChange}
              className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <p className="text-xs text-muted-foreground">
              Maximum size: 1MB. Supported formats: JPG, GIF, or PNG.
            </p>
          </div>
        </div>
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

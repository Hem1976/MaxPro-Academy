"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function AdminSignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="ml-auto"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await signOut("admin");
        });
      }}
    >
      <LogOut className="size-4" aria-hidden="true" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}

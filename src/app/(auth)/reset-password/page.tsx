import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ResetPasswordGate } from "@/components/auth/reset-password-gate";
import { isSupabaseConfigured } from "@/lib/data/demo-store";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose new password | Maxpro Academy",
  description: "Set a new password for your Maxpro Academy learner account.",
};

export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured()) {
    return <ResetPasswordGate demoMode />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <ResetPasswordGate />;
  }

  return <ResetPasswordForm />;
}

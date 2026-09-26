import type { Metadata } from "next";
import { ActivateAccountForm } from "@/components/auth/activate-account-form";
import { clearLearnerSession } from "@/lib/auth/clear-learner-session";

export const metadata: Metadata = {
  title: "Activate account | Maxpro Academy",
  description:
    "Set your password and activate your Maxpro Academy learner account.",
};

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ActivateAccountPage({ searchParams }: PageProps) {
  await clearLearnerSession();

  const params = await searchParams;
  const email = params.email?.trim() ?? "";

  return <ActivateAccountForm defaultEmail={email} />;
}

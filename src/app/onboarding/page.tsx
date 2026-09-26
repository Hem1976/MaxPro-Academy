import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getCurrentUser } from "@/lib/auth/get-user";
import { canAccessAdmin } from "@/lib/auth/roles";
import { getCourses, getProducts } from "@/lib/data/demo-store";

export const metadata: Metadata = {
  title: "Onboarding | Maxpro Academy",
  description: "Personalize your Maxpro Academy learning experience.",
};

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  if (user.profile.onboarding_completed) {
    redirect(
      canAccessAdmin(user.profile.role) ? "/admin/dashboard" : "/dashboard",
    );
  }

  if (canAccessAdmin(user.profile.role)) {
    redirect("/admin/dashboard");
  }

  const products = getProducts({ publishedOnly: true });
  const preferredIds = user.profile.preferred_product_ids ?? [];
  const recommendedCourses = getCourses({ publishedOnly: true }).filter((course) =>
    preferredIds.length > 0
      ? preferredIds.includes(course.product_id)
      : course.featured,
  ).slice(0, 4);

  return (
    <div className="min-h-full bg-surface px-6 py-10">
      <OnboardingWizard
        products={products}
        recommendedCourses={recommendedCourses}
        defaultName={user.profile.full_name ?? ""}
      />
    </div>
  );
}

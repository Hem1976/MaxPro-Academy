"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CourseCard } from "@/components/course/course-card";
import type { Course, LearningRole, Product } from "@/types/database";

const LEARNING_ROLES: Array<{ value: LearningRole; label: string; description: string }> = [
  {
    value: "sales_representative",
    label: "Sales Representative",
    description: "Field sales, visits, and order capture workflows.",
  },
  {
    value: "sales_manager",
    label: "Sales Manager",
    description: "Team oversight, reporting, and performance management.",
  },
  {
    value: "administrator",
    label: "Administrator",
    description: "User management, configuration, and system setup.",
  },
  {
    value: "operations",
    label: "Operations",
    description: "Distribution, logistics, and day-to-day operations.",
  },
  {
    value: "business_owner",
    label: "Business Owner",
    description: "Executive overview and strategic product adoption.",
  },
  {
    value: "trainer",
    label: "Trainer",
    description: "Enable teams and deliver structured product training.",
  },
];

interface OnboardingWizardProps {
  products: Product[];
  recommendedCourses: Course[];
  defaultName?: string;
}

export function OnboardingWizard({
  products,
  recommendedCourses,
  defaultName = "",
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(defaultName);
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [learningRole, setLearningRole] = useState<LearningRole | null>(null);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const handleFinish = () => {
    if (!learningRole || selectedProducts.length === 0 || !fullName.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({
        fullName: fullName.trim(),
        company: company.trim() || null,
        jobTitle: jobTitle.trim() || null,
        learningRole,
        preferredProductIds: selectedProducts,
      });

      if (!result.success) {
        setError(result.error);
      }
    });
  };

  const steps = [
    "Welcome",
    "Solutions",
    "Role",
    "Recommendations",
  ];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Set up your learning path</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Step {step + 1} of {steps.length}: {steps[step]}
          </p>
        </div>
        <Button variant="ghost" onClick={handleSkip}>
          Skip for now
        </Button>
      </div>

      <div className="mb-8 flex gap-2">
        {steps.map((label, index) => (
          <div
            key={label}
            className={`h-1 flex-1 rounded-full ${
              index <= step ? "bg-accent" : "bg-border"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Welcome to Maxpro Academy. Tell us a little about yourself so we can
            personalize your training experience.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="fullName" required>Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jobTitle">Job title</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(1)} disabled={!fullName.trim()}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Which Maxpro solutions are you learning? Select all that apply.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {products.map((product) => {
              const selected = selectedProducts.includes(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    selected
                      ? "border-accent bg-accent-muted"
                      : "border-border hover:border-accent/40"
                  }`}
                >
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {product.short_description}
                  </p>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button
              onClick={() => setStep(2)}
              disabled={selectedProducts.length === 0}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            What best describes your role? We will tailor recommendations accordingly.
          </p>
          <div className="grid gap-3">
            {LEARNING_ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setLearningRole(role.value)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  learningRole === role.value
                    ? "border-accent bg-accent-muted"
                    : "border-border hover:border-accent/40"
                }`}
              >
                <p className="font-medium text-foreground">{role.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {role.description}
                </p>
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} disabled={!learningRole}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Based on your selections, here are courses we recommend starting with.
          </p>
          {recommendedCourses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {recommendedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  productName={course.product?.name ?? "Maxpro"}
                  productCategory={course.product?.category}
                  title={course.title}
                  description={course.short_description ?? undefined}
                  href={`/courses/${course.slug}`}
                  thumbnailUrl={course.thumbnail_url}
                  level={course.level}
                  durationMinutes={course.estimated_minutes}
                  certificateEnabled={course.certificate_enabled}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-border bg-surface px-4 py-6 text-sm text-muted-foreground">
              Explore the course catalog from your dashboard to find training for your products.
            </p>
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={handleFinish} disabled={isPending}>
              {isPending ? "Saving..." : "Go to dashboard"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

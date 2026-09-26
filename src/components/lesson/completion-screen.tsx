import Link from "next/link";
import { Award, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CompletionScreenProps {
  courseTitle: string;
  courseSlug: string;
  recipientName: string;
  certificateEnabled: boolean;
  hasCertificate: boolean;
  className?: string;
}

export function CompletionScreen({
  courseTitle,
  courseSlug,
  recipientName,
  certificateEnabled,
  hasCertificate,
  className,
}: CompletionScreenProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-2xl px-4 py-16 text-center sm:px-6",
        className,
      )}
    >
      <div
        className="mx-auto flex size-20 items-center justify-center rounded-full bg-navy text-navy-foreground"
        aria-hidden="true"
      >
        <Award className="size-10" />
      </div>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight text-navy">
        Course complete
      </h1>

      <p className="mt-4 text-lg text-muted-foreground">
        Congratulations, {recipientName}! You&apos;ve finished{" "}
        <span className="font-medium text-foreground">{courseTitle}</span>.
      </p>

      <p className="mt-2 text-sm text-muted-foreground">
        Your progress has been recorded. Keep building your skills across the
        Maxpro Academy catalog.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {certificateEnabled && hasCertificate && (
          <Link href="/certificates">
            <Button variant="primary" size="lg">
              <Award className="size-4" aria-hidden="true" />
              View certificate
            </Button>
          </Link>
        )}

        <Link href={`/courses/${courseSlug}`}>
          <Button variant="outline" size="lg">
            <BookOpen className="size-4" aria-hidden="true" />
            Review course
          </Button>
        </Link>

        <Link href="/dashboard">
          <Button variant="ghost" size="lg">
            Go to dashboard
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>

      {certificateEnabled && !hasCertificate && (
        <p className="mt-8 text-sm text-muted-foreground">
          Complete all required lessons and knowledge checks to unlock your
          certificate.
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandedLayout } from "@/components/layout/branded-layout";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <BrandedLayout>
    <Container className="flex flex-col items-center py-24 text-center lg:py-32">
      <p className="font-mono text-sm text-muted">Error</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground leading-relaxed">
        An unexpected error occurred while loading this page. You can try again,
        or return to the home page.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    </Container>
    </BrandedLayout>
  );
}

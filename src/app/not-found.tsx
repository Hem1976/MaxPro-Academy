import Link from "next/link";
import { BrandedLayout } from "@/components/layout/branded-layout";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <BrandedLayout>
    <Container className="flex flex-col items-center py-24 text-center lg:py-32">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Check the URL, or return to the course catalog.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
        <Link href="/courses">
          <Button variant="primary">Browse courses</Button>
        </Link>
      </div>
    </Container>
    </BrandedLayout>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  Images,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CourseCard } from "@/components/course/course-card";
import { ProductCard } from "@/components/course/product-card";
import { FadeIn } from "@/components/marketing/fade-in";
import { HeroComposition } from "@/components/marketing/hero-composition";
import { getOrderedLessonsForCourse } from "@/lib/data/demo-store";
import {
  getCoursesByProduct,
  getFeaturedProducts,
  getPublishedCourses,
} from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Learn. Practice. Master.",
  description:
    "Maxpro Academy — product training for Rockey, RocketSales Pharma, Rockey Agro, and more. Real screenshots, written guides, knowledge checks, and certificates.",
  openGraph: {
    title: "Maxpro Academy — Learn. Practice. Master.",
    description:
      "Structured training for Maxpro software products used by field sales and agronomy teams.",
  },
};

const EXPERIENCE = [
  {
    icon: BookOpen,
    title: "Written guides",
    description:
      "Step-by-step instruction for the workflows your team runs every day.",
  },
  {
    icon: Images,
    title: "Real screenshots",
    description:
      "Learn from actual product screens — not generic LMS placeholders.",
  },
  {
    icon: TrendingUp,
    title: "Progress tracking",
    description:
      "See where you are in each course and pick up exactly where you left off.",
  },
  {
    icon: ClipboardCheck,
    title: "Knowledge checks",
    description:
      "Confirm understanding with a final quiz before you earn a certificate.",
  },
  {
    icon: Award,
    title: "Certificates",
    description:
      "Receive a Maxpro Academy certificate you can verify online.",
  },
] as const;

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Choose your product",
    description:
      "Start with Rockey, RocketSales Pharma, Rockey Agro, or another Maxpro product.",
  },
  {
    step: "02",
    title: "Take the Fundamentals course",
    description: "Work through lessons with written guides and real screenshots.",
  },
  {
    step: "03",
    title: "Pass the knowledge check",
    description: "Complete the final quiz with a passing score of 70%.",
  },
  {
    step: "04",
    title: "Earn your certificate",
    description: "Download and share a verifiable Maxpro Academy certificate.",
  },
] as const;

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();
  const featuredCourses = getPublishedCourses({ featuredOnly: true });

  return (
    <>
      <section className="border-b border-border">
        <Container className="py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Logo
                variant="full"
                href="/"
                priority
                className="!h-12 sm:!h-14"
              />
              <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-accent">
                Learn. Practice. Master.
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-navy sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Maxpro Academy
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Learn how to use Maxpro products through real screenshots,
                written walkthroughs, and knowledge checks — then earn a
                certificate.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/products">
                  <Button variant="primary" size="lg">
                    Explore products
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Learner sign in
                  </Button>
                </Link>
              </div>
            </div>

            <HeroComposition />
          </div>
        </Container>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-16 lg:py-20">
          <Container>
            <FadeIn>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-navy">
                    Maxpro products
                  </h2>
                  <p className="mt-2 max-w-xl text-muted-foreground">
                    One Fundamentals course per product — focused on the
                    workflows new customers need first.
                  </p>
                </div>
                <Link
                  href="/products"
                  className="text-sm font-medium text-accent hover:text-accent-hover"
                >
                  View all products
                </Link>
              </div>
            </FadeIn>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product, index) => (
                <FadeIn key={product.id} delay={index * 0.05}>
                  <ProductCard
                    title={product.name}
                    description={product.short_description ?? undefined}
                    href={`/products/${product.slug}`}
                    imageUrl={product.cover_image_url}
                    logoUrl={product.logo_url}
                    category={product.category}
                    courseCount={getCoursesByProduct(product.slug).length}
                    ctaLabel="Explore"
                  />
                </FadeIn>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="border-y border-border bg-surface py-16 lg:py-20">
        <Container>
          <FadeIn>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">
              How learning works
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Screenshot-led lessons first. Videos can be added later without
              changing the Academy.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCE.map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.05}>
                <div className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                    <item.icon className="size-4 text-navy" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {featuredCourses.length > 0 && (
        <section className="py-16 lg:py-20">
          <Container>
            <FadeIn>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-navy">
                    Fundamentals courses
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Four launch courses — one for each Maxpro product.
                  </p>
                </div>
                <Link
                  href="/courses"
                  className="text-sm font-medium text-accent hover:text-accent-hover"
                >
                  Browse all courses
                </Link>
              </div>
            </FadeIn>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {featuredCourses.map((course, index) => (
                <FadeIn key={course.id} delay={index * 0.05}>
                  <CourseCard
                    productName={course.product?.name ?? "Maxpro"}
                    productCategory={course.product?.category}
                    title={course.title}
                    description={course.short_description ?? undefined}
                    href={`/courses/${course.slug}`}
                    thumbnailUrl={course.thumbnail_url}
                    level={course.level}
                    durationMinutes={course.estimated_minutes}
                    lessonCount={getOrderedLessonsForCourse(course.id).length}
                    certificateEnabled={course.certificate_enabled}
                  />
                </FadeIn>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="border-t border-border bg-surface py-16 lg:py-20">
        <Container>
          <FadeIn>
            <h2 className="text-2xl font-semibold tracking-tight text-navy">
              The path to a certificate
            </h2>
          </FadeIn>

          <ol className="mt-12 space-y-0">
            {PROCESS_STEPS.map((step, index) => (
              <FadeIn key={step.step} delay={index * 0.04}>
                <li className="grid gap-4 border-t border-border py-8 first:border-t-0 first:pt-0 lg:grid-cols-[80px_220px_1fr] lg:gap-8">
                  <span className="font-mono text-sm text-muted">{step.step}</span>
                  <h3 className="font-semibold text-navy">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </li>
              </FadeIn>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-border bg-navy py-16 lg:py-20">
        <Container className="text-center">
          <FadeIn>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Ready to begin?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/70">
              Explore your Maxpro product, start the Fundamentals course, and
              earn a certificate.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/products">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-navy hover:bg-white/90"
                >
                  Explore products
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Learner sign in
                </Button>
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}

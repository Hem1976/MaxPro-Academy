import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/marketing/fade-in";
import { SITE_CONFIG } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Help",
  description:
    "Get support for Maxpro Academy. Contact our helpdesk for account, enrollment, and technical questions.",
};

const FAQ = [
  {
    question: "How do I access a course?",
    answer:
      "Browse the course catalog, select a course, and sign in to enroll. Once enrolled, you can start from the first lesson and track your progress from your dashboard.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Yes. A Maxpro Academy account lets you enroll in courses, save progress, and access certificates when available.",
  },
  {
    question: "How do certificates work?",
    answer:
      "Courses with certificates enabled require you to complete all required lessons and pass any knowledge checks. Your certificate will be available from your profile once earned.",
  },
  {
    question: "Can my organization assign training?",
    answer:
      "Administrators can manage users and course assignments through the Academy admin panel. Contact your organization's Maxpro administrator for access.",
  },
] as const;

export default function HelpPage() {
  return (
    <Container className="py-12 lg:py-16">
      <FadeIn>
        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            Help &amp; support
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            We&apos;re here to help you get the most from {SITE_CONFIG.name}.
            For account issues, enrollment questions, or technical difficulties,
            reach out to our team.
          </p>
        </header>
      </FadeIn>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <FadeIn>
          <div className="rounded-lg border border-border bg-surface p-8">
            <div className="flex size-10 items-center justify-center rounded-md border border-border bg-card">
              <Mail className="size-4 text-navy" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-lg font-semibold text-navy">
              Email support
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Send us a message and we&apos;ll respond as soon as possible.
              Include your account email and a brief description of the issue.
            </p>
            <a
              href={`mailto:${SITE_CONFIG.supportEmail}`}
              className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover"
            >
              {SITE_CONFIG.supportEmail}
            </a>
            <div className="mt-6">
              <a href={`mailto:${SITE_CONFIG.supportEmail}`}>
                <Button variant="primary">Send email</Button>
              </a>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="rounded-lg border border-border p-8">
            <div className="flex size-10 items-center justify-center rounded-md border border-border bg-surface">
              <MessageCircle className="size-4 text-navy" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-lg font-semibold text-navy">
              Before you write
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li>Check that you&apos;re signed in with the correct account.</li>
              <li>
                Confirm your organization has granted access to the course you
                need.
              </li>
              <li>
                Note the course or lesson name if reporting a content issue.
              </li>
              <li>
                For product-specific questions, mention which Maxpro product
                you&apos;re training on.
              </li>
            </ul>
          </div>
        </FadeIn>
      </div>

      <section className="mt-16">
        <FadeIn>
          <h2 className="text-xl font-semibold tracking-tight text-navy">
            Common questions
          </h2>
        </FadeIn>

        <dl className="mt-8 divide-y divide-border border-y border-border">
          {FAQ.map((item, index) => (
            <FadeIn key={item.question} delay={index * 0.04}>
              <div className="py-6">
                <dt className="font-medium text-foreground">{item.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </dd>
              </div>
            </FadeIn>
          ))}
        </dl>
      </section>

      <FadeIn delay={0.1}>
        <p className="mt-12 text-sm text-muted-foreground">
          Looking for training content?{" "}
          <Link href="/courses" className="text-accent hover:text-accent-hover">
            Browse courses
          </Link>{" "}
          or explore by{" "}
          <Link
            href="/products"
            className="text-accent hover:text-accent-hover"
          >
            product
          </Link>
          .
        </p>
      </FadeIn>
    </Container>
  );
}

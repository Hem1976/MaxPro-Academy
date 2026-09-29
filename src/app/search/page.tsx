"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchAcademy } from "@/actions/search";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { useSearchDialog } from "@/components/shared/search-dialog";

interface ResultItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  href: string;
}

function resultHref(item: Awaited<ReturnType<typeof searchAcademy>>[number]): string {
  if (item.type === "product") return `/products/${item.slug}`;
  if (item.type === "course") return `/courses/${item.slug}`;
  if (item.courseSlug) return `/courses/${item.courseSlug}/lesson/${item.slug}`;
  return "/courses";
}

function resultCategory(item: Awaited<ReturnType<typeof searchAcademy>>[number]): string {
  if (item.type === "product") return "Solution";
  if (item.type === "course") return `Course · ${item.productName ?? "Maxpro"}`;
  return `Lesson · ${item.courseTitle ?? "Course"}`;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const { setOpen: setSearchOpen } = useSearchDialog();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      const items = await searchAcademy(query.trim());
      setResults(
        items.map((item) => ({
          id: `${item.type}-${item.id}`,
          title: item.title,
          description: item.description ?? undefined,
          category: resultCategory(item),
          href: resultHref(item),
        })),
      );
    });
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const next = params.toString();
    router.replace(next ? `/search?${next}` : "/search", { scroll: false });
  }, [query, router]);

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-navy dark:text-foreground">
          Search
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find solutions, courses, and lessons across Maxpro Academy.
        </p>

        <div className="relative mt-6">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search solutions, courses, and lessons..."
            className="pl-9"
            autoFocus
            aria-label="Search academy"
          />
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Tip: press{" "}
          <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>{" "}
          /{" "}
          <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[10px]">
            Ctrl K
          </kbd>{" "}
          anywhere to open quick search.
        </p>

        <div className="mt-8">
          {!query.trim() && (
            <p className="text-center text-sm text-muted-foreground">
              Start typing to see results.
            </p>
          )}

          {query.trim() && isPending && (
            <p className="text-center text-sm text-muted-foreground">
              Searching...
            </p>
          )}

          {query.trim() && !isPending && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {results.length > 0 && (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    href={result.href}
                    className="block px-4 py-4 transition-colors hover:bg-surface focus-ring"
                  >
                    <p className="font-medium text-foreground">{result.title}</p>
                    {result.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {result.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-accent">{result.category}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Container>
  );
}

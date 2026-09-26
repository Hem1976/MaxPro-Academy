"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchAcademy } from "@/actions/search";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

interface SiteSearchProps {
  open: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  href: string;
}

export function SiteSearch({ open, onClose }: SiteSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

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
          category:
            item.type === "product"
              ? "Product"
              : item.type === "course"
                ? `Course · ${item.productName ?? "Maxpro"}`
                : `Lesson · ${item.courseTitle ?? "Course"}`,
          href:
            item.type === "product"
              ? `/products/${item.slug}`
              : item.type === "course"
                ? `/courses/${item.slug}`
                : item.courseSlug
                  ? `/courses/${item.courseSlug}/lesson/${item.slug}`
                  : "/courses",
        })),
      );
    });
  }, [query]);

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} size="lg" className="!p-0">
      <div className="border-b border-border p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, courses, and lessons..."
            className="pl-9"
            autoFocus
            aria-label="Search academy"
          />
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto p-2">
        {!query.trim() && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Start typing to search
          </div>
        )}

        {query.trim() && !isPending && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No results found
          </div>
        )}

        {isPending && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        )}

        <ul role="listbox" aria-label="Search results">
          {results.map((result) => (
            <li key={result.id} role="option">
              <button
                type="button"
                onClick={() => handleSelect(result.href)}
                className="flex w-full flex-col gap-0.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-surface focus-ring"
              >
                <span className="text-sm font-medium text-foreground">
                  {result.title}
                </span>
                {result.description && (
                  <span className="text-xs text-muted-foreground">
                    {result.description}
                  </span>
                )}
                {result.category && (
                  <span className="text-xs text-accent">{result.category}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export function SearchTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface focus-ring"
      aria-label="Search academy"
    >
      <Search className="size-4" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] md:inline">
        Ctrl K
      </kbd>
    </button>
  );
}

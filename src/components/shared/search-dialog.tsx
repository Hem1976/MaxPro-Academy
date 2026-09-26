"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category?: string;
  onSelect: () => void;
}

export interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSearch?: (query: string) => SearchResult[];
  placeholder?: string;
  emptyState?: ReactNode;
  className?: string;
}

export function SearchDialog({
  open,
  onClose,
  onSearch,
  placeholder = "Search courses, lessons, and more...",
  emptyState,
  className,
}: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (onSearch && query.trim()) {
      setResults(onSearch(query.trim()));
    } else {
      setResults([]);
    }
  }, [query, onSearch]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      result.onSelect();
      onClose();
    },
    [onClose],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      className={cn("!p-0", className)}
    >
      <div className="border-b border-border p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-9"
            autoFocus
            aria-label="Search"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Press <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[10px]">Esc</kbd> to close
        </p>
      </div>

      <div className="max-h-80 overflow-y-auto p-2">
        {query.trim() && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {emptyState ?? "No results found"}
          </div>
        )}

        {!query.trim() && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Start typing to search
          </div>
        )}

        {results.length > 0 && (
          <ul role="listbox" aria-label="Search results">
            {results.map((result) => (
              <li key={result.id} role="option">
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
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
        )}
      </div>
    </Modal>
  );
}

export function useSearchDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { open, setOpen };
}

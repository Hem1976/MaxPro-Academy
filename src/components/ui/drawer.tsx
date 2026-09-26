"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { IconButton } from "./icon-button";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "left",
  className,
}: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const slideFrom = side === "left" ? { x: "-100%" } : { x: "100%" };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="presentation">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-near-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={slideFrom}
            animate={{ x: 0 }}
            exit={slideFrom}
            transition={{ type: "tween", duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "absolute top-0 flex h-full w-72 max-w-[85vw] flex-col border-border bg-card shadow",
              side === "left" ? "left-0 border-r" : "right-0 border-l",
              className,
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              {title && (
                <h2 className="text-base font-semibold text-foreground">
                  {title}
                </h2>
              )}
              <IconButton
                label="Close navigation"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-auto"
              >
                <X className="size-4" />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

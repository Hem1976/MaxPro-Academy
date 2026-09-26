"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type MouseEvent,
} from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { IconButton } from "./icon-button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      const dialog = dialogRef.current;
      if (dialog && e.target === dialog) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <dialog
          ref={dialogRef}
          onClose={onClose}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 m-0 size-full max-h-none max-w-none border-none bg-transparent p-4 backdrop:bg-near-black/50 open:flex open:items-center open:justify-center"
          aria-labelledby={title ? "modal-title" : undefined}
          aria-describedby={description ? "modal-description" : undefined}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "relative w-full rounded-lg border border-border bg-card p-6 shadow",
              sizeClasses[size],
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-foreground"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="modal-description"
                    className="mt-1 text-sm text-muted-foreground"
                  >
                    {description}
                  </p>
                )}
              </div>
              <IconButton
                label="Close dialog"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="size-4" />
              </IconButton>
            </div>
            {children}
          </motion.div>
        </dialog>
      )}
    </AnimatePresence>
  );
}

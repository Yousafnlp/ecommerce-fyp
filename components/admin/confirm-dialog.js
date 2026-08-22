"use client";

import { useEffect, useRef } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Accessible confirmation modal for destructive or significant actions.
 *
 * - role="dialog" + aria-modal, labelled by its title and description
 * - Escape cancels (unless a request is in flight)
 * - focus starts on Cancel (the safe choice) and stays trapped while open
 * - the confirm button shows a spinner and locks out double submissions
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  pending = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousActive = document.activeElement;
    const previouslyScrollable = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape" && !pending) {
        event.stopPropagation();
        onCancel();
        return;
      }

      if (event.key !== "Tab") return;

      // Simple focus trap: cycle between focusable elements in the dialog.
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previouslyScrollable;
      previousActive?.focus?.();
    };
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        aria-hidden="true"
        onClick={() => !pending && onCancel()}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={typeof description === "string" ? "confirm-dialog-description" : undefined}
        className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg animate-in zoom-in-95"
      >
        <div className="flex items-start gap-3">
          {destructive ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <TriangleAlert className="w-5 h-5 text-destructive" aria-hidden="true" />
            </div>
          ) : null}
          <div className="min-w-0">
            <h2 id="confirm-dialog-title" className="text-lg font-semibold leading-snug">
              {title}
            </h2>
            <div
              id="confirm-dialog-description"
              className="mt-1.5 text-sm text-muted-foreground [&_strong]:text-foreground [&_strong]:font-semibold"
            >
              {description}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-xl border bg-card/50 px-4 text-sm font-medium shadow-sm transition-all outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={pending}
            className="gap-2"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

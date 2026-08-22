"use client";

import { Loader2, PackageOpen, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shared loading / empty / error states so every admin screen communicates
 * the same way.
 */

export function AdminLoading({ label = "Loading…" }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 py-16"
      role="status"
    >
      <Loader2 className="w-7 h-7 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function AdminEmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <PackageOpen className="w-10 h-10 text-muted-foreground/60 mb-1" aria-hidden="true" />
      <p className="font-semibold">{title}</p>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function AdminErrorState({ message, onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
      role="alert"
    >
      <TriangleAlert className="w-8 h-8 text-destructive" aria-hidden="true" />
      <p className="font-semibold">Something went wrong</p>
      <p className="max-w-md text-sm text-muted-foreground">
        {message || "An unexpected error occurred."}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

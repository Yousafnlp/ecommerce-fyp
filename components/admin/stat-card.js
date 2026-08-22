"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Dashboard stat tile. Optionally links to the section it summarizes.
 */
export function StatCard({ label, value, hint, icon: Icon, href, tone = "default" }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <Icon
            className={cn("w-4 h-4", tone === "accent" ? "text-primary" : "text-muted-foreground")}
            aria-hidden="true"
          />
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </>
  );

  const className =
    "block rounded-xl border border-border bg-card p-5 shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    (href ? "hover:border-primary/40 hover:shadow-[var(--shadow-card)]" : "");

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}

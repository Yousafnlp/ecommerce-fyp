"use client";

import { cn } from "@/lib/utils";

/**
 * Minimal styled table primitives shared by every admin list screen so all
 * tables look and behave the same (horizontal scroll on small screens,
 * consistent header/row treatment, zebra-free readable rows).
 */
export function AdminTable({ children, ariaLabel }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label={ariaLabel}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function AdminTableHead({ children }) {
  return (
    <thead className="border-b border-border bg-muted/40">
      <tr>{children}</tr>
    </thead>
  );
}

export function AdminTableHeader({ children, className }) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap",
        className
      )}
    >
      {children}
    </th>
  );
}

export function AdminTableBody({ children }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function AdminTableRow({ children, className }) {
  return (
    <tr className={cn("transition-colors hover:bg-accent/40", className)}>{children}</tr>
  );
}

export function AdminTableCell({ children, className }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}

export function AdminTableEmpty({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-muted-foreground">
        {children}
      </td>
    </tr>
  );
}

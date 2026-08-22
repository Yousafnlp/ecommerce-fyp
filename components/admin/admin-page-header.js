"use client";

/**
 * Consistent page header for every admin screen: title, one-line description
 * of what the page does, and a right-aligned slot for primary actions.
 */
export function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

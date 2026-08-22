export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-56 rounded-lg bg-muted mb-2" />
          <div className="h-4 w-80 rounded bg-muted/60" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <aside className="lg:w-64 animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                <div className="h-4 w-24 rounded bg-muted" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-3 w-full rounded bg-muted/60" />
                ))}
              </div>
            ))}
          </aside>

          {/* Product grid skeleton */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6 animate-pulse">
              <div className="h-4 w-36 rounded bg-muted" />
              <div className="h-8 w-32 rounded-lg bg-muted" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/60 bg-card overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-muted/60" />
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 rounded-full bg-muted" />
                      <div className="h-5 w-14 rounded-full bg-muted/60" />
                    </div>
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted/60" />
                    <div className="flex justify-between items-center">
                      <div className="h-5 w-20 rounded bg-muted" />
                      <div className="h-4 w-12 rounded bg-muted/60" />
                    </div>
                    <div className="h-8 w-full rounded-lg bg-muted/40" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCompare } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { GitCompare, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare, count, maxCompareItems, lockedCategory } = useCompare();
  const router = useRouter();

  if (count === 0) return null;

  // The page renders from the canonical queue; no params needed.
  const handleCompare = () => {
    router.push("/compare");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-t border-border/60 shadow-[var(--shadow-lift)] animate-in slide-in-from-bottom-2">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-brand opacity-40" />
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shrink-0 shadow-[var(--shadow-card)]">
            <GitCompare className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm shrink-0">
            Compare ({count}/{maxCompareItems})
            {lockedCategory && (
              <span className="ml-2 text-xs font-normal text-muted-foreground capitalize">
                {lockedCategory}
              </span>
            )}
          </span>
          <div className="flex items-center gap-2 overflow-x-auto">
            {compareItems.map((item) => (
              <div key={item.id} className="relative group shrink-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/60 border border-border/60 ring-1 ring-transparent transition-all group-hover:ring-ring/30">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <button
                  onClick={() => removeFromCompare(item.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full hidden group-hover:flex items-center justify-center text-xs leading-none animate-scale-in"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
                <p className="text-xs text-muted-foreground mt-1 max-w-[40px] truncate text-center">
                  {item.name.split(" ")[0]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={clearCompare}>
            Clear
          </Button>
          <Button
            size="sm"
            onClick={handleCompare}
            disabled={count < 2}
            className="gap-2 shine"
          >
            <GitCompare className="w-4 h-4" />
            Compare Now
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCompare } from "@/lib/compare-context";
import { Button } from "@/components/ui/button";
import { GitCompare, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare, count } = useCompare();
  const router = useRouter();

  if (count === 0) return null;

  const handleCompare = () => {
    const ids = compareItems.map((p) => p.id).join(",");
    router.push(`/compare?products=${ids}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-xl animate-in slide-in-from-bottom-2">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <GitCompare className="w-5 h-5 text-primary shrink-0" />
          <span className="font-semibold text-sm shrink-0">
            Compare ({count}/4)
          </span>
          <div className="flex items-center gap-2 overflow-x-auto">
            {compareItems.map((item) => (
              <div key={item.id} className="relative group shrink-0">
                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted border">
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
                  className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full hidden group-hover:flex items-center justify-center text-xs leading-none"
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
            className="gap-2"
          >
            <GitCompare className="w-4 h-4" />
            Compare Now
          </Button>
        </div>
      </div>
    </div>
  );
}

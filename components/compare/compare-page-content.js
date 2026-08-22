"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Share2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  importCompareFromIds,
  removeFromCompare,
  selectCompareItems,
} from "@/store/slices/compare-slice";
import { Database } from "@/lib/database";
import { ComparisonTable } from "@/components/shared/comparison-table";
import { EmptyCompareCard } from "@/components/compare/empty-compare-card";
import { CompareBreadcrumb } from "@/components/compare/compare-breadcrumb";
import { ComparePageHeader } from "@/components/compare/compare-page-header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

function CompareLoadingState() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="aspect-[3/4] rounded-xl border border-border/60 bg-muted/40 animate-pulse"
        />
      ))}
    </div>
  );
}

/**
 * The compare page renders exactly what the canonical Redux queue contains.
 * URL params are never live state: ?share= / legacy ?products= are a one-shot
 * IMPORT mechanism — resolved against the catalog, merged into the queue,
 * then scrubbed from the address bar.
 */
export function ComparePageContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const compareItems = useAppSelector(selectCompareItems);
  const hydrated = useAppSelector((s) => s.compare.hydrated);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [prunedCount, setPrunedCount] = useState(0);

  const idsKey = useMemo(
    () => compareItems.map((p) => p.id).join(","),
    [compareItems]
  );

  // One-shot import of shared comparisons, then URL scrubbed to plain /compare.
  const handledImportRef = useRef("");
  const rawParam = searchParams.get("share") ?? searchParams.get("products");
  useEffect(() => {
    if (!rawParam || !hydrated) return;
    if (handledImportRef.current === rawParam) return;
    handledImportRef.current = rawParam;
    setIsImporting(true);
    dispatch(importCompareFromIds(rawParam.split(",")))
      .unwrap()
      .catch(() => toast.error("Couldn't load that shared comparison."))
      .finally(() => {
        setIsImporting(false);
        router.replace("/compare");
      });
  }, [rawParam, hydrated, dispatch, router, toast]);

  // Resolve queue ids -> full product data; prune ids that no longer exist.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!hydrated) return;
      const ids = idsKey.split(",").filter(Boolean);
      if (ids.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const resolved = await Database.getProductsByIds(ids);
        if (cancelled) return;
        const foundIds = new Set(resolved.map((p) => String(p.id)));
        const missing = ids.filter((id) => !foundIds.has(id));
        if (missing.length > 0) {
          missing.forEach((id) => dispatch(removeFromCompare(id)));
          setPrunedCount((c) => c + missing.length);
        }
        const ordered = ids
          .map((id) => resolved.find((p) => String(p.id) === id))
          .filter(Boolean);
        setProducts(ordered);
      } catch (error) {
        console.error("Failed to load comparison products:", error);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [idsKey, hydrated, dispatch]);

  const handleShare = async () => {
    const url = `${window.location.origin}/compare?share=${idsKey}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Comparison link copied to clipboard.");
    } catch {
      toast.error("Couldn't copy link. Please copy it from the address bar.");
    }
  };

  const showLoading = !hydrated || isLoading || isImporting;

  return (
    <div className="container mx-auto px-4 py-8">
      <CompareBreadcrumb />
      <ComparePageHeader />

      {showLoading ? (
        <CompareLoadingState />
      ) : compareItems.length === 0 ? (
        <EmptyCompareCard />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Comparing {compareItems.length} product{compareItems.length > 1 ? "s" : ""}
              {prunedCount > 0 &&
                ` · ${prunedCount} unavailable product${prunedCount > 1 ? "s" : ""} removed`}
            </p>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Comparison
            </Button>
          </div>
          <ComparisonTable products={products} />
        </div>
      )}
    </div>
  );
}

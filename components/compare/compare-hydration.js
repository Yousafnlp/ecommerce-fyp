"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { hydrateCompare } from "@/store/slices/compare-slice";
import { loadCompareItems } from "@/lib/compare-storage";

/**
 * Fills the canonical compare queue from validated storage exactly once on
 * mount. The store starts empty on server and client alike, so hydration
 * markup always matches; persisted items appear immediately after.
 */
export function CompareHydration() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateCompare(loadCompareItems()));
  }, [dispatch]);

  return null;
}

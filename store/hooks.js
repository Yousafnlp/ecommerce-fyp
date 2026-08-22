"use client";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCompare,
  removeFromCompare,
  clearCompare,
  selectCompareItems,
  selectCompareCount,
  selectLockedCategory,
  validateAddToCompare,
  MAX_COMPARE_ITEMS,
} from "@/store/slices/compare-slice";
import { useToast } from "@/components/ui/toast";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

/**
 * The compare queue has exactly one canonical source: state.compare in Redux.
 * Every consumer reads through this hook and mutates only via its actions.
 */
export function useCompare() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const items = useAppSelector(selectCompareItems);
  const count = useAppSelector(selectCompareCount);
  const lockedCategory = useAppSelector(selectLockedCategory);

  /** { ok, code, message } for a candidate product against current queue. */
  const canAddProduct = useCallback(
    (product) => validateAddToCompare(items, product),
    [items]
  );

  /** Validates, explains rejections via toast, adds on success. */
  const tryAddToCompare = useCallback(
    (product) => {
      const result = validateAddToCompare(items, product);
      if (!result.ok) {
        toast.error(result.message);
        return false;
      }
      dispatch(addToCompare(product));
      if (result.item?.name) {
        toast.success(`Added "${result.item.name}" to comparison.`);
      }
      return true;
    },
    [items, dispatch, toast]
  );

  return {
    // State
    compareItems: items,
    count,
    lockedCategory,
    maxCompareItems: MAX_COMPARE_ITEMS,
    // Actions
    addToCompare: (product) => dispatch(addToCompare(product)),
    removeFromCompare: (id) => dispatch(removeFromCompare(id)),
    clearCompare: () => dispatch(clearCompare()),
    tryAddToCompare,
    // Derived helpers
    isInCompare: (id) => items.some((p) => p.id === String(id ?? "").trim()),
    canAddProduct,
    canAdd: count < MAX_COMPARE_ITEMS,
  };
}

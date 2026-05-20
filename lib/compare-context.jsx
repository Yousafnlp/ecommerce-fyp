"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "specsmart_compare";
const MAX_ITEMS = 4;

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCompareItems(JSON.parse(stored));
    } catch {}
  }, []);

  const persist = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  };

  const addToCompare = useCallback((product) => {
    setCompareItems((prev) => {
      if (prev.length >= MAX_ITEMS) return prev;
      if (prev.some((p) => String(p.id) === String(product.id))) return prev;
      const next = [
        ...prev,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          category: product.category,
        },
      ];
      persist(next);
      return next;
    });
  }, []);

  const removeFromCompare = useCallback((id) => {
    setCompareItems((prev) => {
      const next = prev.filter((p) => String(p.id) !== String(id));
      persist(next);
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const isInCompare = useCallback(
    (id) => compareItems.some((p) => String(p.id) === String(id)),
    [compareItems]
  );

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        canAdd: compareItems.length < MAX_ITEMS,
        count: compareItems.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

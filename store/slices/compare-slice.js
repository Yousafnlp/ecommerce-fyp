import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import {
  MAX_COMPARE_ITEMS,
  loadCompareItems,
  saveCompareItems,
  clearCompareStorage,
} from "@/lib/compare-storage";
import { Database } from "@/lib/database";

export { MAX_COMPARE_ITEMS };

/** Snapshot fields kept in state for bar/badge rendering without fetches. */
function toCompareItem(product) {
  if (!product || typeof product !== "object") return null;
  const id =
    product.id === undefined || product.id === null ? "" : String(product.id).trim();
  if (!id) return null;
  return {
    id,
    name: typeof product.name === "string" ? product.name : "",
    image: typeof product.image === "string" ? product.image : "",
    category: typeof product.category === "string" ? product.category : "",
  };
}

/**
 * The category restriction is derived from the queue itself: the first item
 * with a category locks the queue. Removing the last item resets it.
 */
export function getLockedCategory(items) {
  const first = items.find((p) => p?.category);
  return first?.category || "";
}

export const ADD_REJECTION = {
  INVALID: "invalid",
  DUPLICATE: "duplicate",
  FULL: "full",
  CATEGORY_CONFLICT: "category_conflict",
};

/**
 * Single validation rule for adds. Used by the reducer (so invalid state can
 * never be created programmatically) and by the UI hook (for messaging).
 */
export function validateAddToCompare(items, product) {
  const item = toCompareItem(product);
  if (!item) {
    return { ok: false, code: ADD_REJECTION.INVALID, message: "This product can't be compared." };
  }
  if (items.some((p) => p.id === item.id)) {
    return {
      ok: false,
      code: ADD_REJECTION.DUPLICATE,
      message: `${item.name || "This product"} is already in your comparison.`,
    };
  }
  if (items.length >= MAX_COMPARE_ITEMS) {
    return {
      ok: false,
      code: ADD_REJECTION.FULL,
      message: `Comparison is full (max ${MAX_COMPARE_ITEMS} products).`,
    };
  }
  const lockedCategory = getLockedCategory(items);
  if (
    lockedCategory &&
    item.category &&
    item.category.toLowerCase() !== lockedCategory.toLowerCase()
  ) {
    return {
      ok: false,
      code: ADD_REJECTION.CATEGORY_CONFLICT,
      message: `Can't mix categories — comparison is locked to "${lockedCategory}". Remove ${lockedCategory} products first to compare other categories.`,
    };
  }
  return { ok: true, item };
}

/**
 * Greedy queue builder for imports/share links: keeps the requested order,
 * dedupes, caps at MAX, and silently skips products that would break the
 * single-category rule established by the first valid product.
 */
function buildQueue(products) {
  const queue = [];
  let locked = "";
  for (const product of Array.isArray(products) ? products : []) {
    if (queue.length >= MAX_COMPARE_ITEMS) break;
    const item = toCompareItem(product);
    if (!item) continue;
    if (queue.some((p) => p.id === item.id)) continue;
    const category = item.category || "";
    if (!queue.length) {
      locked = category;
      queue.push(item);
      continue;
    }
    if (locked && category && category.toLowerCase() !== locked.toLowerCase()) continue;
    if (category && !locked) locked = category;
    queue.push(item);
  }
  return queue;
}

/**
 * One-shot import of a shared comparison (e.g. /compare?share=27,2).
 * Resolves ids against the catalog; missing/deleted ids are dropped here so
 * they never enter canonical state.
 */
export const importCompareFromIds = createAsyncThunk(
  "compare/importFromIds",
  async (ids) => {
    const cleanIds = (Array.isArray(ids) ? ids : [])
      .map((id) => String(id ?? "").trim())
      .filter(Boolean)
      .slice(0, MAX_COMPARE_ITEMS);
    if (!cleanIds.length) return [];
    try {
      return await Database.getProductsByIds(cleanIds);
    } catch {
      return [];
    }
  }
);

const initialState = {
  // Starts empty on both server and client; hydrateCompare() fills it once on
  // mount so SSR markup and the first client render always match.
  items: [],
  hydrated: false,
};

function persist(state) {
  if (!state.hydrated) return;
  if (state.items.length) saveCompareItems(state.items);
  else clearCompareStorage();
}

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    /** Load persisted items into canonical state (dispatched once on mount). */
    hydrateCompare(state, action) {
      const queue = buildQueue(action.payload);
      state.items = queue;
      state.hydrated = true;
    },
    addToCompare(state, action) {
      const result = validateAddToCompare(state.items, action.payload);
      if (!result.ok) return;
      state.items.push(result.item);
      persist(state);
    },
    removeFromCompare(state, action) {
      const id = String(action.payload ?? "").trim();
      state.items = state.items.filter((p) => p.id !== id);
      persist(state);
    },
    clearCompare(state) {
      state.items = [];
      persist(state);
    },
    /** Replace the whole queue with pre-resolved products (import path). */
    setCompareQueue(state, action) {
      state.items = buildQueue(action.payload);
      persist(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(importCompareFromIds.fulfilled, (state, action) => {
      state.items = buildQueue(action.payload);
      persist(state);
    });
  },
});

export const {
  hydrateCompare,
  addToCompare,
  removeFromCompare,
  clearCompare,
  setCompareQueue,
} = compareSlice.actions;

export const selectCompareItems = (state) => state.compare.items;
export const selectCompareCount = (state) => state.compare.items.length;

export const selectLockedCategory = createSelector(selectCompareItems, (items) =>
  getLockedCategory(items)
);

export default compareSlice.reducer;

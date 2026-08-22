/**
 * Versioned persistence layer for the compare queue.
 *
 * The Redux compare slice is the single source of truth at runtime; this
 * module is only its storage adapter. All reads/writes go through schema
 * validation so corrupt, outdated, or hostile payloads degrade safely to [].
 *
 * Envelope format (v1):
 *   { "version": 1, "items": [{ id, name, image, category }] }
 */

export const COMPARE_STORAGE_VERSION = 1;

/** Sensible maximum number of simultaneously compared products. */
export const MAX_COMPARE_ITEMS = 4;

const STORAGE_KEY = "specsmart_compare";

/**
 * Validate/normalize a single stored item. Returns null for anything unusable.
 * Only whitelisted fields survive; ids are normalized to strings.
 */
function sanitizeItem(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id === undefined || raw.id === null ? "" : String(raw.id).trim();
  if (!id) return null;
  return {
    id,
    name: typeof raw.name === "string" ? raw.name : "",
    image: typeof raw.image === "string" ? raw.image : "",
    category: typeof raw.category === "string" ? raw.category : "",
  };
}

/**
 * Validate a full payload and return a safe items array:
 * deduped by id, capped at MAX_COMPARE_ITEMS.
 * Accepts the legacy pre-versioning format (bare array) for seamless upgrade.
 */
function sanitizePayload(parsed) {
  let rawItems = null;
  if (Array.isArray(parsed)) {
    rawItems = parsed; // legacy v0 payload
  } else if (
    parsed &&
    typeof parsed === "object" &&
    parsed.version === COMPARE_STORAGE_VERSION &&
    Array.isArray(parsed.items)
  ) {
    rawItems = parsed.items;
  }

  if (!rawItems) return [];

  const seen = new Set();
  const items = [];
  for (const raw of rawItems) {
    const item = sanitizeItem(raw);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
    if (items.length >= MAX_COMPARE_ITEMS) break;
  }
  return items;
}

/** Load persisted compare items. Always resolves to a valid array. */
export function loadCompareItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return sanitizePayload(JSON.parse(raw));
  } catch {
    return [];
  }
}

/** Persist compare items under the versioned envelope. */
export function saveCompareItems(items) {
  if (typeof window === "undefined") return;
  try {
    const safeItems = sanitizePayload(Array.isArray(items) ? items : []);
    if (!safeItems.length) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: COMPARE_STORAGE_VERSION,
        items: safeItems,
      })
    );
  } catch {}
}

/** Remove persisted compare state entirely. */
export function clearCompareStorage() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

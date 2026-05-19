export function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === "") return [];
  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function normalizePriceRange(value) {
  if (!value) return undefined;
  const priceRange = {};
  const min = Number(value.min);
  const max = Number(value.max);

  if (Number.isFinite(min)) priceRange.min = min;
  if (Number.isFinite(max)) priceRange.max = max;

  return priceRange.min !== undefined || priceRange.max !== undefined ? priceRange : undefined;
}

export function mergeSearchFilters(nlpFilters = {}, uiFilters = {}) {
  const normalizedUiBrand = normalizeList(uiFilters.brand);
  const normalizedNlpBrand = normalizeList(nlpFilters.brand);
  const uiPriceRange = normalizePriceRange(uiFilters.priceRange);
  const nlpPriceRange = normalizePriceRange(nlpFilters.priceRange);
  const features = [...normalizeList(nlpFilters.features), ...normalizeList(uiFilters.features)];

  return {
    category: uiFilters.category || nlpFilters.category,
    brand: normalizedUiBrand.length > 0 ? normalizedUiBrand : normalizedNlpBrand,
    features: [...new Set(features)],
    priceRange: {
      ...(nlpPriceRange || {}),
      ...(uiPriceRange || {}),
    },
    rating: uiFilters.rating !== undefined ? Number(uiFilters.rating) : undefined,
    inStock: uiFilters.inStock,
    sortBy: uiFilters.sortBy || nlpFilters.sortBy,
    sortOrder: uiFilters.sortOrder || nlpFilters.sortOrder,
    matchedNames: normalizeList(nlpFilters.matchedNames),
  };
}

function hasPriceRange(priceRange) {
  return priceRange && (priceRange.min !== undefined || priceRange.max !== undefined);
}

function productMatchesFeature(product, feature) {
  const normalizedFeature = normalizeText(feature);
  const rawHaystack = [
    product.name,
    product.brand,
    product.category,
    product.description,
    ...(product.features || []),
    JSON.stringify(product.specifications || {}),
  ].join(" ");
  const haystack = normalizeText(rawHaystack);
  const alias = FEATURE_ALIASES.find((entry) => entry.feature === normalizedFeature);

  return (
    haystack.includes(normalizedFeature) ||
    Boolean(alias?.patterns.some((pattern) => pattern.test(rawHaystack))) ||
    (normalizedFeature === "gaming" && /\b(rtx|radeon|gaming|graphics|144hz|165hz|240hz)\b|strong\s+gpu/i.test(rawHaystack)) ||
    (normalizedFeature === "performance" && /\b(m\d|a\d{2}|i[579]|ryzen|rtx|snapdragon|powerful|fast|pro)\b/i.test(rawHaystack)) ||
    (normalizedFeature === "camera" && /\b(mp|camera|portrait|photography|video)\b/i.test(rawHaystack)) ||
    (normalizedFeature === "battery" && /\b(battery|mah|wh|hours|all-day)\b/i.test(rawHaystack)) ||
    (normalizedFeature === "display" && /\b(oled|amoled|hdr|4k|uhd|retina|ips)\b/i.test(rawHaystack)) ||
    (normalizedFeature === "audio" && /\b(audio|sound|anc|noise|driver|hi-res)\b/i.test(rawHaystack))
  );
}

export function applyProductFilters(products, filters = {}) {
  const category = normalizeText(filters.category);
  const brands = normalizeList(filters.brand).map(normalizeText);
  const features = normalizeList(filters.features);
  const priceRange = normalizePriceRange(filters.priceRange);
  const rating = filters.rating !== undefined ? Number(filters.rating) : undefined;

  return products.filter((product) => {
    const productCategory = normalizeText(product.category);
    const productBrand = normalizeText(product.brand);
    const productPrice = Number(product.price);
    const productRating = Number(product.rating);

    if (category && !productCategory.includes(category) && !category.includes(productCategory)) {
      return false;
    }

    if (brands.length > 0 && !brands.some((brand) => productBrand === brand || productBrand.includes(brand))) {
      return false;
    }

    if (hasPriceRange(priceRange)) {
      if (priceRange.min !== undefined && productPrice < priceRange.min) return false;
      if (priceRange.max !== undefined && productPrice > priceRange.max) return false;
    }

    if (Number.isFinite(rating) && productRating < rating) {
      return false;
    }

    if (filters.inStock !== undefined && Boolean(product.inStock) !== Boolean(filters.inStock)) {
      return false;
    }

    if (features.length > 0 && !features.every((feature) => productMatchesFeature(product, feature))) {
      return false;
    }

    return true;
  });
}
import { FEATURE_ALIASES } from "./aliases.js";

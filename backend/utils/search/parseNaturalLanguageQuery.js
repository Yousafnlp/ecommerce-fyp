import {
  BRAND_PATTERNS,
  CATEGORY_ALIASES,
  FEATURE_ALIASES,
  PRODUCT_NAME_PATTERNS,
  SORT_ALIASES,
} from "./aliases.js";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizePrice(value) {
  if (value === undefined || value === null) return undefined;
  const number = Number(String(value).replace(/[$,\s]/g, ""));
  return Number.isFinite(number) ? number : undefined;
}

function extractFirstCategory(query) {
  const matches = CATEGORY_ALIASES.flatMap(({ category, patterns }) =>
    patterns
      .map((pattern) => {
        const match = query.match(pattern);
        return match ? { category, index: match.index ?? Number.MAX_SAFE_INTEGER } : null;
      })
      .filter(Boolean),
  );

  matches.sort((a, b) => a.index - b.index);
  return matches[0]?.category;
}

function extractBrands(query) {
  return unique(BRAND_PATTERNS.filter(({ pattern }) => pattern.test(query)).map(({ brand }) => brand));
}

function extractFeatures(query) {
  return unique(
    FEATURE_ALIASES.filter(({ patterns }) => patterns.some((pattern) => pattern.test(query))).map(
      ({ feature }) => feature,
    ),
  );
}

function extractPriceRange(query) {
  const priceRange = {};
  const price = String.raw`\$?\s*(\d[\d,]*(?:\.\d+)?)`;
  const patterns = {
    between: [
      new RegExp(String.raw`\bbetween\s+${price}\s+and\s+${price}\b`, "i"),
      new RegExp(String.raw`\bfrom\s+${price}\s+to\s+${price}\b`, "i"),
      new RegExp(String.raw`\brange\s+${price}\s+to\s+${price}\b`, "i"),
      new RegExp(String.raw`\b${price}\s*-\s*${price}\b`, "i"),
    ],
    under: [
      new RegExp(String.raw`\bunder\s+${price}\b`, "i"),
      new RegExp(String.raw`\bbelow\s+${price}\b`, "i"),
      new RegExp(String.raw`\bless\s+than\s+${price}\b`, "i"),
      new RegExp(String.raw`\bcheaper\s+than\s+${price}\b`, "i"),
      new RegExp(String.raw`\bmax(?:imum)?\s+${price}\b`, "i"),
      new RegExp(String.raw`\bupto\s+${price}\b`, "i"),
      new RegExp(String.raw`\bup\s+to\s+${price}\b`, "i"),
      new RegExp(String.raw`<=\s*${price}`, "i"),
    ],
    above: [
      new RegExp(String.raw`\babove\s+${price}\b`, "i"),
      new RegExp(String.raw`\bover\s+${price}\b`, "i"),
      new RegExp(String.raw`\bmore\s+than\s+${price}\b`, "i"),
      new RegExp(String.raw`\bgreater\s+than\s+${price}\b`, "i"),
      new RegExp(String.raw`\bmin(?:imum)?\s+${price}\b`, "i"),
      new RegExp(String.raw`>=\s*${price}`, "i"),
    ],
  };

  for (const pattern of patterns.between) {
    const match = query.match(pattern);
    if (!match) continue;
    const first = normalizePrice(match[1]);
    const second = normalizePrice(match[2]);
    if (first !== undefined && second !== undefined) {
      priceRange.min = Math.min(first, second);
      priceRange.max = Math.max(first, second);
      return priceRange;
    }
  }

  for (const pattern of patterns.under) {
    const match = query.match(pattern);
    const max = normalizePrice(match?.[1]);
    if (max !== undefined) priceRange.max = max;
  }

  for (const pattern of patterns.above) {
    const match = query.match(pattern);
    const min = normalizePrice(match?.[1]);
    if (min !== undefined) priceRange.min = min;
  }

  return priceRange.min !== undefined || priceRange.max !== undefined ? priceRange : undefined;
}

function extractProductNames(query) {
  const names = [];

  for (const pattern of PRODUCT_NAME_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of query.matchAll(pattern)) {
      names.push(match[0].replace(/\s+/g, " ").trim());
    }
  }

  return unique(names);
}

function extractSort(query) {
  const matches = SORT_ALIASES.flatMap((sortRule) =>
    sortRule.patterns
      .map((pattern) => {
        const match = query.match(pattern);
        return match
          ? {
              sortBy: sortRule.sortBy,
              sortOrder: sortRule.sortOrder,
              index: match.index ?? Number.MAX_SAFE_INTEGER,
            }
          : null;
      })
      .filter(Boolean),
  );

  matches.sort((a, b) => a.index - b.index);
  const match = matches[0];
  return match ? { sortBy: match.sortBy, sortOrder: match.sortOrder } : {};
}

export function parseNaturalLanguageQuery(query = "") {
  const normalizedQuery = String(query).trim();
  const sort = extractSort(normalizedQuery);

  return {
    category: extractFirstCategory(normalizedQuery),
    brand: extractBrands(normalizedQuery),
    features: extractFeatures(normalizedQuery),
    priceRange: extractPriceRange(normalizedQuery),
    matchedNames: extractProductNames(normalizedQuery),
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  };
}

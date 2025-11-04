import { SearchFilters } from "./types";

export interface NaturalLanguageQuery {
  intent: "find" | "compare" | "recommend";
  category?: string;
  brand?: string[];
  priceRange?: { min?: number; max?: number };
  features?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function parseNaturalLanguageQuery(query: string): NaturalLanguageQuery {
  const lowerQuery = query.toLowerCase();

  // Extract intent
  let intent: NaturalLanguageQuery["intent"] = "find";
  if (lowerQuery.includes("compare") || lowerQuery.includes("vs")) {
    intent = "compare";
  } else if (
    lowerQuery.includes("recommend") ||
    lowerQuery.includes("suggest") ||
    lowerQuery.includes("best")
  ) {
    intent = "recommend";
  }

  // Extract category
  const categories = [
    "smartphone",
    "laptop",
    "tablet",
    "smartwatch",
    "headphones",
    "camera",
  ];
  const category = categories.find(
    (cat) =>
      lowerQuery.includes(cat) ||
      lowerQuery.includes(cat + "s") ||
      (cat === "smartphone" &&
        (lowerQuery.includes("phone") || lowerQuery.includes("mobile")))
  );

  // Extract brand
  const definedBrands = [
    "apple",
    "samsung",
    "sony",
    "dell",
    "hp",
    "lenovo",
    "google",
    "oneplus",
  ];
  const brand = definedBrands.filter((b) => lowerQuery.includes(b));

  // Extract price range
  let priceRange: { min?: number; max?: number } | undefined;
  const priceMatches = lowerQuery.match(
    /(?:under|below|less than|<)\s*\$?(\d+)|(?:over|above|more than|>)\s*\$?(\d+)|(?:between|from)\s*\$?(\d+)(?:\s*(?:to|and|-)\s*\$?(\d+))?/g
  );

  if (priceMatches) {
    priceRange = {};
    priceMatches.forEach((match) => {
      if (
        match.includes("under") ||
        match.includes("below") ||
        match.includes("less than") ||
        match.includes("<")
      ) {
        const price = Number.parseInt(match.match(/\d+/)?.[0] || "0");
        priceRange!.max = price;
      } else if (
        match.includes("over") ||
        match.includes("above") ||
        match.includes("more than") ||
        match.includes(">")
      ) {
        const price = Number.parseInt(match.match(/\d+/)?.[0] || "0");
        priceRange!.min = price;
      } else if (match.includes("between") || match.includes("from")) {
        const prices = match.match(/\d+/g);
        if (prices && prices.length >= 2) {
          priceRange!.min = Number.parseInt(prices[0]);
          priceRange!.max = Number.parseInt(prices[1]);
        }
      }
    });
  }

  // Extract features
  const features: string[] = [];
  const featureKeywords = [
    "camera",
    "battery",
    "storage",
    "ram",
    "memory",
    "display",
    "screen",
    "gaming",
    "work",
    "business",
    "student",
    "professional",
    "portable",
    "wireless",
    "bluetooth",
    "wifi",
    "5g",
    "4g",
    "fast charging",
    "waterproof",
    "durable",
    "lightweight",
    "compact",
  ];

  featureKeywords.forEach((keyword) => {
    if (lowerQuery.includes(keyword)) {
      features.push(keyword);
    }
  });

  // Extract sort preference
  let sortBy: string | undefined;
  let sortOrder: "asc" | "desc" | undefined;
  if (lowerQuery.includes("cheapest") || lowerQuery.includes("lowest price")) {
    sortBy = "price";
    sortOrder = "asc";
  } else if (
    lowerQuery.includes("expensive") ||
    lowerQuery.includes("premium")
  ) {
    sortBy = "price";
    sortOrder = "desc";
  } else if (
    lowerQuery.includes("best rated") ||
    lowerQuery.includes("highest rated")
  ) {
    sortBy = "rating";
    sortOrder = "desc";
  } else if (lowerQuery.includes("newest") || lowerQuery.includes("latest")) {
    sortBy = "newest";
    sortOrder = "desc";
  } else if (lowerQuery.includes("best") || lowerQuery.includes("top")) {
    sortBy = "score";
    sortOrder = "desc";
  }

  return {
    intent,
    category,
    brand,
    priceRange:
      priceRange && (priceRange.min || priceRange.max) ? priceRange : undefined,
    features: features.length > 0 ? features : undefined,
    sortBy,
    sortOrder,
  };
}

export function mapNaturalQueryToFilters(
  nq: NaturalLanguageQuery
): SearchFilters {
  return {
    category: nq.category,
    brand: nq.brand,
    priceRange:
      nq.priceRange?.min !== undefined || nq.priceRange?.max !== undefined
        ? {
            min: nq.priceRange.min ?? 0,
            max: nq.priceRange.max ?? Number.MAX_VALUE,
          }
        : undefined,
    features: nq.features,
    sortBy:
      nq.sortBy === "price" ||
      nq.sortBy === "rating" ||
      nq.sortBy === "score" ||
      nq.sortBy === "newest"
        ? (nq.sortBy as SearchFilters["sortBy"])
        : undefined,
    sortOrder: nq.sortOrder,
  };
}

export function generateSearchSuggestions(query: string): string[] {
  if (!query || query.length < 2) return [];

  const suggestions = [
    `${query} under $500`,
    `best ${query} 2024`,
    `${query} with good battery`,
    `${query} for gaming`,
    `${query} comparison`,
    `cheap ${query}`,
    `premium ${query}`,
    `${query} reviews`,
    `${query} vs alternatives`,
    `latest ${query}`,
  ];

  return suggestions.slice(0, 5);
}

export function highlightSearchTerms(
  text: string,
  searchQuery: string
): string {
  if (!searchQuery) return text;

  const terms = searchQuery
    .toLowerCase()
    .split(" ")
    .filter((term) => term.length > 2);
  let highlightedText = text;

  terms.forEach((term) => {
    const regex = new RegExp(`(${term})`, "gi");
    highlightedText = highlightedText.replace(regex, "<mark>$1</mark>");
  });

  return highlightedText;
}

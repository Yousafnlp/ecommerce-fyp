import { SearchFilters } from "./types";

export interface NaturalLanguageQuery {
  intent: "find" | "compare" | "recommend";
  category?: string;
  brand?: string[];
  priceRange?: { min?: number; max?: number };
  features?: string[];
  matchedNames?: string[];
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
    "headphone",
    "monitor",
    "processor",
    "charger",
    "earbuds",
    "power bank",
    "lcd",
    "smartwatch",
    "router",
    "console",
    "storage",
    "tablet",
  ];
  const category = categories.find((cat) => {
    const regex = new RegExp(`\\b${cat}(es|s)?\\b`, "i");
    if (regex.test(lowerQuery)) return true;

    if (cat === "smartphone") {
      return /\b(phone|mobile|smartphone)s?\b/i.test(lowerQuery);
    }
    return false;
  });

  // Extract brand
  const definedBrands = [
    "Apple",
    "Samsung",
    "Sony",
    "Dell",
    "LG",
    "Intel",
    "ASUS",
    "AMD",
    "Anker",
    "TP-Link",
    "Seagate",
    "Google",
    "Garmin",
  ];
  const brand = definedBrands.filter((b) =>
    lowerQuery.includes(b.toLowerCase())
  );

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
    "Titanium Design",
    "A17 Pro Chip",
    "Pro Camera System",
    "5G Ready",
    "S Pen Included",
    "AI Photography",
    "200MP Camera",
    "Titanium Build",
    "M3 Pro Chip",
    "Liquid Retina XDR",
    "All-day Battery",
    "Pro Connectivity",
    "Active Noise Canceling",
    "30hr Battery",
    "Quick Charge",
    "Multipoint Connection",
    "Full HD",
    "IPS Panel",
    "75Hz Refresh",
    "Eye Comfort Mode",
    "Nano IPS",
    "1ms Response",
    "4K HDR",
    "HDMI 2.1",
    "24 Cores",
    "5.8GHz Boost",
    "DDR5 Support",
    "PCIe 5.0",
    "45W Output",
    "USB-C",
    "Travel Friendly",
    "49-inch Curved",
    "Quantum Mini-LED",
    "240Hz Refresh",
    "HDR2000",
    "OLED HDR Display",
    "Lightweight Design",
    "Intel 13th Gen",
    "16 Cores",
    "Boost up to 5.7GHz",
    "Noise Canceling",
    "LDAC Support",
    "8h Battery",
    "Hi-Res Audio Wireless",
    "25600mAh Capacity",
    "87W Output",
    "4 Ports",
    "Fast Recharging",
    "20W Output",
    "Compact Design",
    "Fast Charging",
    "4K UHD",
    "HDR10",
    "Slim Bezel",
    "ECG App",
    "Fitness Tracking",
    "Crash Detection",
    "Tri-Band",
    "8 LAN Ports",
    "Game Accelerator",
    "4K Gaming",
    "Ray Tracing",
    "Ultra Fast SSD",
    "2TB Storage",
    "USB 3.2",
    "Plug-and-Play",
    "120Hz AMOLED",
    "Multitasking Ready",
    "Tensor G3",
    "OLED Display",
    "Magic Eraser",
    "RTX 4060",
    "20000mAh",
    "Dual Ports",
    "Wi-Fi 6",
    "Dual Band",
    "8 Antennas",
    "Fanless design",
    "Wi-Fi 6E",
    "Silent operation",
    "Face ID",
    "Thunderbolt 4",
    "ProMotion 120Hz",
    "Voice Assistant support",
    "Music storage",
    "Garmin Pay",
    "Factory calibrated",
    "USB-C hub",
    "KVM switch",
  ];

  featureKeywords.forEach((keyword) => {
    if (lowerQuery.includes(keyword.toLowerCase())) {
      features.push(keyword);
    }
  });

  // Extract Product Names
  const productNamePatterns = [
    /\b(?:iphone|ipad|macbook|imac|apple watch)\s?\d{0,2}\s?(?:pro|plus|ultra|max)?\b/i,
    /\b(?:galaxy|note|tab|z\s?flip|z\s?fold)\s?\w*\b/i,
    /\b(?:pixel)\s?\d{1,2}\s?(?:pro|a)?\b/i,
    /\b(?:playstation|xbox|switch)\s?\d*\b/i,
    /\b(?:rtx|gtx|rx)\s?\d{3,4}\s?(?:ti|super|xt)?\b/i,
    /\b(?:ryzen|intel\s?(?:i[3579]|core\s?i[3579]))\s?\w*\b/i,
    /\b(?:dell|asus|hp|acer|lenovo)\s?\w*\s?\d{0,4}\b/i,
    /\b(?:anker|tp-link|seagate)\s?\w*\b/i,
    /\b(?:m[123]|a1[0-9]|snapdragon\s?\d{3,4})\s?(?:pro|max)?\b/i,
  ];

  const potentialNames: { name: string; score: number }[] = [];

  // Check known brand+model patterns
  for (const pattern of productNamePatterns) {
    const match = query.match(pattern);
    if (match) {
      const name = match[0].trim();
      // Confidence: higher if brand also detected
      const brandHit = definedBrands.some((b) =>
        name.toLowerCase().includes(b.toLowerCase())
      );
      const score = brandHit ? 0.9 : 0.8;
      potentialNames.push({ name, score });
    }
  }

  // Deduplicate and keep high-confidence ones
  const uniqueNames = [
    ...new Map(
      potentialNames
        .filter((n) => n.score >= 0.8)
        .map((n) => [n.name.toLowerCase(), n])
    ).values(),
  ].map((n) => n.name);

  // Extract sort preference
  let sortBy: string | undefined;
  let sortOrder: "asc" | "desc" | undefined;
  if (
    lowerQuery.includes("cheap") ||
    lowerQuery.includes("lowest price") ||
    lowerQuery.includes("budget")
  ) {
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
    lowerQuery.includes("highest rated") ||
    lowerQuery.includes("top rated")
  ) {
    sortBy = "rating";
    sortOrder = "desc";
  } else if (
    lowerQuery.includes("newest") ||
    lowerQuery.includes("latest") ||
    lowerQuery.includes("recent")
  ) {
    sortBy = "newest";
    sortOrder = "desc";
  } else if (
    lowerQuery.includes("popular") ||
    lowerQuery.includes("most reviewed") ||
    lowerQuery.includes("famous") ||
    lowerQuery.includes("trending")
  ) {
    sortBy = "popularity";
    sortOrder = "desc";
  } else if (lowerQuery.includes("score")) {
    sortBy = "score";
    sortOrder = "desc";
  }
  if (lowerQuery.includes("ascending")) {
    sortOrder = "asc";
  } else if (lowerQuery.includes("descending")) {
    sortOrder = "desc";
  }

  return {
    intent,
    category,
    brand,
    priceRange:
      priceRange && (priceRange.min || priceRange.max) ? priceRange : undefined,
    features: features.length > 0 ? features : undefined,
    matchedNames: uniqueNames.length ? uniqueNames : undefined,
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

export const CATEGORY_ALIASES = [
  {
    category: "smartphone",
    patterns: [
      /\bsmart\s*phones?\b/i,
      /\bcell\s*phones?\b/i,
      /\bphones?\b/i,
      /\bmobiles?\b/i,
    ],
  },
  {
    category: "laptop",
    patterns: [/\blaptops?\b/i, /\bnotebooks?\b/i, /\bultrabooks?\b/i, /\bmacbooks?\b/i],
  },
  {
    category: "headphone",
    patterns: [
      /\bheadphones?\b/i,
      /\bheadsets?\b/i,
      /\bover\s*ear\b/i,
      /\bwireless\s*headphones?\b/i,
    ],
  },
  {
    category: "earbuds",
    patterns: [/\bearbuds?\b/i, /\bbuds?\b/i, /\btws\b/i, /\bin\s*ear\b/i],
  },
  {
    category: "tablet",
    patterns: [/\btablets?\b/i, /\bipads?\b/i, /\btabs?\b/i],
  },
  {
    category: "smartwatch",
    patterns: [/\bsmart\s*watches?\b/i, /\bwatches?\b/i, /\bwearables?\b/i],
  },
  {
    category: "monitor",
    patterns: [/\bmonitors?\b/i, /\bdisplays?\b/i, /\bgaming\s*monitors?\b/i],
  },
  {
    category: "router",
    patterns: [/\brouters?\b/i, /\bwifi\s*routers?\b/i, /\bwi-fi\s*routers?\b/i, /\bmodems?\b/i],
  },
  {
    category: "console",
    patterns: [/\bconsoles?\b/i, /\bgaming\s*consoles?\b/i, /\bplaystations?\b/i, /\bxbox\b/i],
  },
  {
    category: "storage",
    patterns: [/\bssds?\b/i, /\bhdds?\b/i, /\bstorage\s*drives?\b/i, /\bnvme\b/i],
  },
];

export const BRAND_ALIASES = [
  "Apple",
  "Samsung",
  "Sony",
  "Dell",
  "HP",
  "ASUS",
  "Acer",
  "Lenovo",
  "Intel",
  "AMD",
  "NVIDIA",
  "LG",
  "Google",
  "OnePlus",
  "Xiaomi",
  "MSI",
  "Razer",
  "TP-Link",
  "Seagate",
  "Logitech",
  "Corsair",
  "Anker",
];

export const BRAND_PATTERNS = BRAND_ALIASES.map((brand) => ({
  brand,
  pattern: new RegExp(`\\b${brand.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&").replace(/\\-/g, "[-\\s]?")}\\b`, "i"),
}));

export const FEATURE_ALIASES = [
  {
    feature: "battery",
    patterns: [/\blong\s*battery\b/i, /\bbattery\s*life\b/i, /\ball\s*day\s*battery\b/i, /\bhuge\s*battery\b/i, /\bbattery\b/i],
  },
  {
    feature: "camera",
    patterns: [/\bcameras?\b/i, /\bphotography\b/i, /\bportraits?\b/i, /\bselfies?\b/i, /\bphotos?\b/i],
  },
  {
    feature: "gaming",
    patterns: [/\bgaming\b/i, /\bfps\b/i, /\besports?\b/i, /\bhigh\s*performance\b/i],
  },
  {
    feature: "display",
    patterns: [/\boled\b/i, /\bamoled\b/i, /\bhdr\b/i, /\b4k\b/i, /\buhd\b/i],
  },
  {
    feature: "audio",
    patterns: [/\banc\b/i, /\bnoise\s*cancell?ation\b/i, /\bnoise\s*cancell?ing\b/i, /\bhi[-\s]?res\s*audio\b/i],
  },
  {
    feature: "performance",
    patterns: [/\bfast\b/i, /\bpowerful\b/i, /\bflagship\b/i, /\bperformance\b/i],
  },
];

export const PRODUCT_NAME_PATTERNS = [
  /\biPhone\s+\d{1,2}(?:\s+(?:Pro|Plus|Max|Mini|Ultra))*\b/gi,
  /\bGalaxy\s+S\d{1,2}(?:\s+(?:Ultra|Plus|FE|Pro|Max))*\b/gi,
  /\bPixel\s+\d{1,2}(?:\s+(?:Pro|XL|Fold|A))*\b/gi,
  /\bRTX\s+\d{3,4}(?:\s*Ti)?\b/gi,
  /\bRyzen\s+\d(?:\s+\d{3,5}[A-Z0-9]*)?\b/gi,
  /\bMacBook\s+(?:Air|Pro)(?:\s+[A-Z]\d(?:\s*(?:Pro|Max|Ultra))?)?\b/gi,
  /\bPlayStation\s+\d\b/gi,
  /\bPS\s*\d\b/gi,
  /\bXbox\s+Series\s+[SX]\b/gi,
];

export const SORT_ALIASES = [
  { sortBy: "price", sortOrder: "asc", patterns: [/\bcheapest\b/i, /\bcheap\b/i, /\baffordable\b/i, /\bbudget\b/i, /\blow\s*price\b/i, /\blowest\b/i, /\blow\s*to\s*high\b/i] },
  { sortBy: "price", sortOrder: "desc", patterns: [/\bexpensive\b/i, /\bpremium\b/i, /\bluxury\b/i, /\bflagship\b/i, /\bhigh\s*end\b/i, /\bmost\s*expensive\b/i, /\bhigh\s*to\s*low\b/i] },
  { sortBy: "rating", sortOrder: "desc", patterns: [/\bbest\s*rated\b/i, /\bhighest\s*rated\b/i, /\btop\s*rated\b/i] },
  { sortBy: "popularity", sortOrder: "desc", patterns: [/\bpopular\b/i, /\btrending\b/i, /\bfamous\b/i, /\bmost\s*reviewed\b/i] },
  { sortBy: "newest", sortOrder: "desc", patterns: [/\bnewest\b/i, /\blatest\b/i, /\brecent\b/i, /\bnewly\s*launched\b/i] },
  { sortBy: "score", sortOrder: "desc", patterns: [/\bbest\s*overall\b/i, /\bhighest\s*score\b/i] },
];

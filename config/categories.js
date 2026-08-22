export const categories = [
  "smartphone",
  "laptop",
  "tablet",
  "smartwatch",
  "headphone",
  "earbuds",
  "monitor",
  "router",
  "console",
  "storage",
  "processor",
  "charger",
  "power bank",
  "lcd",
];

export const brands = [
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
  "Garmin",
];

export function pluralizeCategory(category) {
  if (!category) return "";
  const cache = {
    earbuds: "earbuds",
    headphones: "headphones",
    "power bank": "power banks",
    lcd: "LCD Monitors",
  };
  if (cache[category]) return cache[category];
  if (/s$|x$|ch$|sh$/.test(category)) return `${category}es`;
  return `${category}s`;
}

export const categoryInfo = {
  smartphone: {
    title: "Smartphones",
    description:
      "Latest smartphones with cutting-edge features and performance",
  },
  laptop: {
    title: "Laptops",
    description: "Powerful laptops for work, gaming, and creative projects",
  },
  tablet: {
    title: "Tablets",
    description: "Versatile tablets for productivity and entertainment",
  },
  smartwatch: {
    title: "Smartwatches",
    description: "Smart wearables to track fitness and stay connected",
  },
  headphone: {
    title: "Headphones",
    description: "Premium audio devices for music lovers and professionals",
  },
  earbuds: {
    title: "Earbuds",
    description: "Compact true wireless audio for everyday listening",
  },
  monitor: {
    title: "Monitors",
    description:
      "High-resolution displays for work, gaming, and content creation",
  },
  router: {
    title: "Routers",
    description: "Reliable networking gear for fast, stable connectivity",
  },
  console: {
    title: "Consoles",
    description: "Next-generation gaming consoles for ultimate play",
  },
  storage: {
    title: "Storage",
    description: "SSDs and HDDs for speed and capacity",
  },
  processor: {
    title: "Processors",
    description: "Powerful CPUs for performance-hungry workflows",
  },
  charger: {
    title: "Chargers",
    description: "Fast, efficient charging solutions for all your devices",
  },
  "power bank": {
    title: "Power Banks",
    description: "Portable batteries to keep your devices charged anywhere",
  },
  lcd: {
    title: "LCD Monitors",
    description: "Crisp monitors for everyday home and office use",
  },
};
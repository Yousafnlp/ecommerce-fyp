export interface Product {
  id: string;
  name: string;
  brand: string;
  category:
    | "smartphone"
    | "laptop"
    | "tablet"
    | "smartwatch"
    | "headphone"
    | "earbuds"
    | "monitor"
    | "lcd"
    | "processor"
    | "charger"
    | "power bank"
    | "camera"
    | "router"
    | "console"
    | "storage";
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  specifications: ProductSpecs;
  score: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  description: string;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSpecs {
  // ─── Common specs ───────────────────────────────
  brand: string;
  model: string;
  color?: string;
  weight?: string;
  dimensions?: string;

  // ─── Display-capable devices (phones, laptops, tablets, monitors, LCDs) ───
  display?: {
    size: string;
    resolution: string;
    type: string; // e.g. OLED, IPS, VA, Mini-LED
    refreshRate?: string;
    responseTime?: string; // monitors
    brightness?: string;
    hdr?: string;
    touch?: boolean; // tablets, laptops
  };

  // ─── Smartphones / Tablets / Laptops ─────────────
  processor?: string;
  ram?: string;
  storage?: string;
  battery?: string;
  camera?: {
    main: string;
    front?: string;
    features?: string[];
  };
  os?: string;
  connectivity?: string[];

  // ─── Laptop specifics ────────────────────────────
  cpu?: string;
  gpu?: string;
  screenSize?: string;
  storageType?: "SSD" | "HDD" | "Hybrid";
  ports?: string[];

  // ─── Tablets specifics ───────────────────────────
  stylusSupport?: boolean;
  expandableStorage?: boolean;

  // ─── Smartwatches ────────────────────────────────
  strapMaterial?: string;
  waterResistance?: string; // e.g. "5ATM", "IP68"
  sensors?: string[]; // e.g. ["Heart Rate", "SpO2", "GPS"]
  batteryLife?: string; // e.g. "18 hours"

  // ─── Audio devices (headphone / Earbuds / Speakers) ───────────────
  driverSize?: string;
  frequency?: string;
  impedance?: string;
  wireless?: boolean;
  noiseCancellation?: boolean;
  drivers?: string;
  microphone?: boolean;
  batteryPlayback?: string; // e.g. "30 hours"
  chargingTime?: string;
  waterproof?: string; // e.g. "IPX4"
  audioCodecs?: string[]; // e.g. ["AAC", "LDAC"]

  // ─── Speakers (dedicated) ────────────────────────
  powerOutput?: string; // e.g. "20W RMS"
  channels?: string; // e.g. "2.1"
  smartFeatures?: string[]; // e.g. ["Voice Assistant", "App Control"]

  // ─── Smart Speakers (Alexa, Google Home, etc.) ───
  assistant?: string; // e.g. "Alexa", "Google Assistant"
  farFieldMics?: number;

  // ─── Gaming Consoles ─────────────────────────────
  generation?: string; // e.g. "PlayStation 5"
  storageOptions?: string[];
  backwardCompatibility?: boolean;

  // ─── Routers ─────────────────────────────────────
  wifiStandard?: string; // e.g. "Wi-Fi 6E"
  frequencyBands?: string[]; // e.g. ["2.4GHz", "5GHz", "6GHz"]
  lanPorts?: number;
  maxSpeed?: string; // e.g. "5400 Mbps"
  antennas?: string;

  // ─── External Hard Drives ────────────────────────
  capacity?: string; // e.g. "2TB"
  driveType?: "HDD" | "SSD";
  interface?: string; // e.g. "USB 3.2", "Thunderbolt"

  // ─── Graphics Cards ──────────────────────────────
  vram?: string; // e.g. "12GB GDDR6X"
  baseClock?: string;
  boostClock?: string;
  tdp?: string;
  outputs?: string[]; // e.g. ["HDMI 2.1", "DisplayPort 1.4a"]
  architecture?: string;

  // ─── CPU specs ───────────────────────────────────
  cores?: number;
  threads?: number;
  socket?: string;

  // ─── Charger / Power Banks ───────────────────────
  maxOutput?: string; // unify charger/power bank output, e.g. "65W"
  portType?: string; // e.g. "USB-C"
  compatibility?: string[];
  fastCharging?: boolean;
  wirelessCharging?: boolean;

  // ─── Cables & Adapters ───────────────────────────
  cableType?: string; // e.g. "HDMI 2.1", "USB-C to Lightning"
  length?: string; // e.g. "1.5m"
  dataTransferRate?: string; // e.g. "40Gbps"
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  favoriteCategories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  preferredBrands: string[];
  notifications: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface SearchFilters {
  category?: string;
  brand?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  inStock?: boolean;
  features?: string[];
  sortBy?: "price" | "rating" | "score" | "newest";
  sortOrder?: "asc" | "desc";
}

export interface ComparisonProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  score: number;
  specifications: ProductSpecs;
  image: string;
}

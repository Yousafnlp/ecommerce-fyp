export interface Product {
  id: string
  name: string
  brand: string
  category: "smartphone" | "laptop" | "tablet" | "smartwatch" | "headphones" | "camera"
  price: number
  originalPrice?: number
  image: string
  images: string[]
  specifications: ProductSpecs
  score: number
  rating: number
  reviewCount: number
  inStock: boolean
  description: string
  features: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ProductSpecs {
  // Common specs
  brand: string
  model: string
  color?: string
  weight?: string
  dimensions?: string

  // Smartphone/Tablet specs
  display?: {
    size: string
    resolution: string
    type: string
    refreshRate?: string
  }
  processor?: string
  ram?: string
  storage?: string
  battery?: string
  camera?: {
    main: string
    front?: string
    features?: string[]
  }
  os?: string
  connectivity?: string[]

  // Laptop specs
  cpu?: string
  gpu?: string
  screenSize?: string
  storageType?: "SSD" | "HDD" | "Hybrid"
  ports?: string[]

  // Audio specs (headphones)
  driverSize?: string
  frequency?: string
  impedance?: string
  wireless?: boolean
  noiseCancellation?: boolean

  // Camera specs
  megapixels?: string
  lens?: string
  videoRecording?: string
  iso?: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  favoriteCategories: string[]
  priceRange: {
    min: number
    max: number
  }
  preferredBrands: string[]
  notifications: boolean
}

export interface CartItem {
  productId: string
  quantity: number
  addedAt: Date
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: Address
  paymentMethod: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface SearchFilters {
  category?: string
  brand?: string[]
  priceRange?: {
    min: number
    max: number
  }
  rating?: number
  inStock?: boolean
  features?: string[]
  sortBy?: "price" | "rating" | "score" | "newest"
  sortOrder?: "asc" | "desc"
}

export interface ComparisonProduct {
  id: string
  name: string
  brand: string
  price: number
  score: number
  specifications: ProductSpecs
  image: string
}

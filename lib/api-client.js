const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Generic API fetch function with error handling
 */
export async function apiFetch(
  endpoint,
  { auth = false, headers = {}, ...options } = {}
) {
  const url = `${API_BASE_URL}${endpoint}`;
  let authHeader = {};
  if (auth && typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      authHeader.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...headers,
    },
    cache: "no-store",
  });

  // 🚨 ONLY throw for auth errors
  if (auth && (res.status === 401 || res.status === 403)) {
    const err = new Error("AUTH_ERROR");
    err.status = res.status;
    throw err;
  }

  // 🌍 Other errors bubble up
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "Request failed");
  }

  return json.data;
}

/**
 * Build query string from object
 */
function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const apiClient = {
  async signup({ email, password, name }) {
    return apiFetch("/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });
  },
  async signin({ email, password }) {
    return apiFetch("/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  },
  /**
   * Get featured products
   */
  async getFeaturedProducts() {
    return apiFetch("/products/featured");
  },

  /**
   * Get popular products
   */
  async getPopularProducts() {
    return apiFetch("/products/popular");
  },

  /**
   * Search products
   */
  async searchProducts(query) {
    return apiFetch(`/products/search${buildQueryString({ q: query })}`);
  },

  /**
   * Get products with filters
   */
  async getProducts(filters) {
    const params = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.brand) {
      // Backend accepts comma-separated or multiple brand params
      if (Array.isArray(filters.brand)) {
        params.brand = filters.brand.join(",");
      } else {
        params.brand = filters.brand;
      }
    }
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters?.rating !== undefined) params.rating = filters.rating;
    if (filters?.inStock !== undefined) params.inStock = filters.inStock;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

    return apiFetch(`/products${buildQueryString(params)}`);
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category) {
    return apiFetch(`/products/category/${encodeURIComponent(category)}`);
  },

  /**
   * Get product by ID
   */
  async getProductById(id) {
    return apiFetch(`/products/${encodeURIComponent(id)}`);
  },
};

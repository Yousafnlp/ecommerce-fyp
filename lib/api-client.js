const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function apiFetch(
  endpoint,
  { auth = false, headers = {}, ...options } = {},
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeader = {};

  if (auth && typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      authHeader.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    credentials: auth ? "include" : "same-origin", // ✅ FIX
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...headers,
    },
    cache: "no-store",
  });

  if (auth && (res.status === 401 || res.status === 403)) {
    const err = new Error("AUTH_ERROR");
    err.status = res.status;
    throw err;
  }

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

function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const apiClient = {
  signup(data) {
    return apiFetch("/auth/signup", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(data),
    });
  },

  signin(data) {
    return apiFetch("/auth/signin", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(data),
    });
  },

  refresh() {
    return apiFetch("/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
  },

  getUser() {
    return apiFetch("/auth/fetchUser", { auth: true });
  },

  signout() {
    return apiFetch("/auth/signout", {
      method: "POST",
      credentials: "include",
    });
  },

  getFeaturedProducts() {
    return apiFetch("/products/featured");
  },

  getPopularProducts() {
    return apiFetch("/products/popular");
  },

  searchProducts(query, filters = {}) {
    return apiFetch(
      `/products/search${buildQueryString({
        q: query,
        category: filters.category,
        brand: Array.isArray(filters.brand)
          ? filters.brand.join(",")
          : filters.brand,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        rating: filters.rating,
        inStock: filters.inStock,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })}`,
    );
  },

  getProductSuggestions(query) {
    return apiFetch(
      `/products/suggestions${buildQueryString({
        q: query,
      })}`,
    );
  },

  getProducts(filters = {}) {
    return apiFetch(
      `/products${buildQueryString({
        category: filters.category,
        brand: Array.isArray(filters.brand)
          ? filters.brand.join(",")
          : filters.brand,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        rating: filters.rating,
        inStock: filters.inStock,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })}`,
    );
  },

  getProductsByCategory(category) {
    return apiFetch(`/products/category/${encodeURIComponent(category)}`);
  },

  getProductById(id) {
    return apiFetch(`/products/${encodeURIComponent(id)}`);
  },

  getCommerce() {
    return apiFetch("/users/me/commerce", { auth: true });
  },

  getOrders() {
    return apiFetch("/users/me/orders", { auth: true });
  },

  getWishlist() {
    return apiFetch("/users/me/wishlist", { auth: true });
  },

  addCartItem(data) {
    return apiFetch("/users/me/cart", {
      method: "POST",
      auth: true,
      body: JSON.stringify(data),
    });
  },

  removeCartItem(productId) {
    return apiFetch(`/users/me/cart/${encodeURIComponent(productId)}`, {
      method: "DELETE",
      auth: true,
    });
  },

  clearCart() {
    return apiFetch("/users/me/cart", {
      method: "DELETE",
      auth: true,
    });
  },

  toggleWishlist(productId) {
    return apiFetch("/users/me/wishlist/toggle", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ productId }),
    });
  },

  placeOrder(payload) {
    return apiFetch("/users/me/orders", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
  },

  getAdminOrderedProducts() {
    return apiFetch("/users/admin/ordered-products", { auth: true });
  },

  getAdminOrderSummary() {
    return apiFetch("/users/admin/orders-summary", { auth: true });
  },

  createProduct(payload) {
    return apiFetch("/products", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
  },

  clearChatSession(sessionId) {
    return apiFetch("/chatbot/session", {
      method: "DELETE",
      body: JSON.stringify({ sessionId }),
    });
  },

  reindexChatbot() {
    return apiFetch("/chatbot/reindex", { method: "POST", auth: true });
  },

  getChatbotStatus() {
    return apiFetch("/chatbot/status");
  },
};

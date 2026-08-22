// Resolve the API base URL per environment:
//  - Browser: same-origin "/api" — Next.js rewrites proxy /api/* to the
//    backend, so CORS never applies regardless of the localhost port.
//  - Next.js server (server components / SSR): call the backend directly.
//    Server-to-server requests carry no Origin header, so CORS is not an
//    issue, and Next requires an ABSOLUTE URL for server-side fetch.
//  - Production: set NEXT_PUBLIC_API_URL to the deployed backend.
function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  // Only honor an absolute configured URL — a relative value (e.g. "/api")
  // must never be used server-side, where relative fetch URLs throw.
  const isAbsolute = Boolean(configured) && /^https?:\/\//.test(configured);

  if (typeof window !== "undefined") {
    return isAbsolute ? configured.replace(/\/$/, "") : "/api";
  }
  if (isAbsolute) {
    return configured.replace(/\/$/, "");
  }
  // BACKEND_URL is the bare backend origin (no "/api" suffix).
  const backend = (process.env.BACKEND_URL || "http://localhost:3001").replace(
    /\/$/,
    "",
  );
  return `${backend}/api`;
}

export async function apiFetch(
  endpoint,
  { auth = false, headers = {}, credentials, ...options } = {},
) {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const authHeader = {};

  if (auth && typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      authHeader.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    credentials: credentials ?? (auth ? "include" : "same-origin"),
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
        features: Array.isArray(filters.features)
          ? filters.features.join(",")
          : filters.features,
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
        features: Array.isArray(filters.features)
          ? filters.features.join(",")
          : filters.features,
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

  updateProduct(id, payload) {
    return apiFetch(`/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    });
  },

  deleteProduct(id) {
    return apiFetch(`/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
      auth: true,
    });
  },

  getAdminUsers(params = {}) {
    return apiFetch(
      `/users/admin/users${buildQueryString({
        q: params.q,
        role: params.role,
        status: params.status,
      })}`,
      { auth: true },
    );
  },

  getAdminUserStats() {
    return apiFetch("/users/admin/stats", { auth: true });
  },

  updateUserRole(userId, role) {
    return apiFetch(`/users/admin/users/${encodeURIComponent(userId)}/role`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({ role }),
    });
  },

  updateUserStatus(userId, status) {
    return apiFetch(
      `/users/admin/users/${encodeURIComponent(userId)}/status`,
      {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ status }),
      },
    );
  },

  deleteUser(userId) {
    return apiFetch(`/users/admin/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      auth: true,
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

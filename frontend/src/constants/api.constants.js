// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

// export const API_ENDPOINTS = {
//   AUTH: {
//     REGISTER:      "/auth/register",
//     LOGIN:         "/auth/login",
//     LOGOUT:        "/auth/logout",
//     REFRESH:       "/auth/refresh-token",
//     ME:            "/auth/me",
//   },
//   PRODUCTS: {
//     BASE:          "/products",
//     SEARCH:        "/products/search",
//     BY_ID:         (id) => `/products/${id}`,
//   },
//   CART: {
//     BASE:          "/cart",
//     ITEMS:         "/cart/items",
//     ITEM:          (id) => `/cart/items/${id}`,
//   },
//   WISHLIST: {
//     BASE:          "/wishlist",
//     ITEM:          (id) => `/wishlist/${id}`,
//   },
//   ORDERS: {
//     BASE:          "/orders",
//     MY_ORDERS:     "/orders/my",
//     BY_ID:         (id) => `/orders/${id}`,
//   },
//   PAYMENT: {
//     CREATE:        "/payment/create",
//     VERIFY:        "/payment/verify",
//   },
//   REVIEWS: {
//     BASE:          (productId) => `/products/${productId}/reviews`,
//     BY_ID:         (productId, reviewId) => `/products/${productId}/reviews/${reviewId}`,
//   },
//   ANALYTICS: {
//     DASHBOARD:     "/analytics/dashboard",
//   },
// };

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh-token",
    ME: "/auth/me",
  },
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id) => `/products/${id}`,
  },
  CART: {
    BASE: "/cart",
    ITEMS: "/cart/items",
    ITEM: (id) => `/cart/items/${id}`,
  },
  WISHLIST: {
    BASE: "/wishlist",
    ITEM: (id) => `/wishlist/${id}`,
  },
  ORDERS: {
    BASE: "/orders",
    MY_ORDERS: "/orders/my",
    BY_ID: (id) => `/orders/${id}`,
  },
  PAYMENT: {
    CREATE: "/payments/create",
    VERIFY: "/payments/verify",
  },
  REVIEWS: {
    BASE: (productId) => `/products/${productId}/review`,
  },
  ANALYTICS: {
    DASHBOARD: "/analytics/dashboard",
  },
};
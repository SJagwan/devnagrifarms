import api from "../apiClient";

// Customer-specific endpoints (require customer auth)
export const customerAPI = {
  // Profile
  getProfile: () => api.get("/customer/profile"),

  // Products
  getProducts: (params = {}) => api.get("/customer/products", { params }),
  getProductById: (id) => api.get(`/customer/products/${id}`),
  getProductVariants: (productId) =>
    api.get(`/customer/products/${productId}/variants`),

  // Categories
  getCategories: () => api.get("/customer/categories"),

  // Orders
  createOrder: (data) => api.post("/customer/orders", data),

  // Addresses
  getAddresses: () => api.get("/customer/addresses"),
  addAddress: (data) => api.post("/customer/addresses", data),

  // Subscriptions
  createSubscription: (data) => api.post("/customer/subscriptions", data),
  getSubscriptions: () => api.get("/customer/subscriptions"),
  pauseSubscription: (id) => api.post(`/customer/subscriptions/${id}/pause`),
  resumeSubscription: (id) => api.post(`/customer/subscriptions/${id}/resume`),
  cancelSubscription: (id) => api.post(`/customer/subscriptions/${id}/cancel`),

  // Serviceability
  checkServiceability: (data) =>
    api.post("/customer/serviceability/check", data),
};

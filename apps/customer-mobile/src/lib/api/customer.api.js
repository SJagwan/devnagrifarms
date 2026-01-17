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

  // Serviceability
  checkServiceability: (data) =>
    api.post("/customer/serviceability/check", data),
};

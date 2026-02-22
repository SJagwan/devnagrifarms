import api from "./http";

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  me: () => api.get("/auth/me"),
};

export const adminAPI = {
  // Categories
  getCategories: (params = {}) => api.get("/admin/categories", { params }),
  getCategory: (id) => api.get(`/admin/categories/${id}`),
  createCategory: (payload) => api.post("/admin/categories", payload),
  updateCategory: (id, payload) =>
    api.put(`/admin/categories/${id}`, payload, {
      meta: { successMessage: "Category updated" },
    }),
  deleteCategory: (id) =>
    api.delete(`/admin/categories/${id}`, {
      meta: { successMessage: "Category deleted" },
    }),

  // Products
  getProducts: (params = {}) => api.get("/admin/products", { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (payload) =>
    api.post("/admin/products", payload, {
      meta: { successMessage: "Product created" },
    }),
  updateProduct: (id, payload) =>
    api.put(`/admin/products/${id}`, payload, {
      meta: { successMessage: "Product updated" },
    }),
  deleteProduct: (id) =>
    api.delete(`/admin/products/${id}`, {
      meta: { successMessage: "Product deleted" },
    }),

  // Product variants
  getProductVariants: (productId, params = {}) =>
    api.get(`/admin/products/${productId}/variants`, { params }),
  createProductVariant: (productId, payload) =>
    api.post(`/admin/products/${productId}/variants`, payload, {
      meta: { successMessage: "Variant created" },
    }),
  updateProductVariant: (productId, variantId, payload) =>
    api.put(`/admin/products/${productId}/variants/${variantId}`, payload, {
      meta: { successMessage: "Variant updated" },
    }),
  deleteProductVariant: (productId, variantId) =>
    api.delete(`/admin/products/${productId}/variants/${variantId}`, {
      meta: { successMessage: "Variant deleted" },
    }),

  // Serviceable areas
  getServiceableAreas: (params = {}) =>
    api.get("/admin/serviceable-areas", { params }),
  getServiceableArea: (id) => api.get(`/admin/serviceable-areas/${id}`),
  createServiceableArea: (payload) =>
    api.post("/admin/serviceable-areas", payload, {
      meta: { successMessage: "Serviceable area created" },
    }),
  updateServiceableArea: (id, payload) =>
    api.put(`/admin/serviceable-areas/${id}`, payload, {
      meta: { successMessage: "Serviceable area updated" },
    }),
  deleteServiceableArea: (id) =>
    api.delete(`/admin/serviceable-areas/${id}`, {
      meta: { successMessage: "Serviceable area deleted" },
    }),

  // Users
  getUsers: (params = {}) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
};

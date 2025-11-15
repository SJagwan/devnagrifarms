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

  //   // Products
  //   getProducts: (params = {}) => api.get("/admin/products", { params }),
  //   getProduct: (id) => api.get(`/admin/products/${id}`),
  //   createProduct: (payload) =>
  //     api.post("/admin/products", payload, {
  //       meta: { successMessage: "Product created" },
  //     }),
  //   updateProduct: (id, payload) =>
  //     api.put(`/admin/products/${id}`, payload, {
  //       meta: { successMessage: "Product updated" },
  //     }),
  //   deleteProduct: (id) =>
  //     api.delete(`/admin/products/${id}`, {
  //       meta: { successMessage: "Product deleted" },
  //     }),
};

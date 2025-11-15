import api from "./http";

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  me: () => api.get("/auth/me"),
};

export const adminAPI = {};

import api from "../apiClient";

export const authAPI = {
  requestOTP: (phone) =>
    api.post("/auth/otp/request", { phone, user_type: "customer" }),
  verifyOTP: (phone, otp) =>
    api.post("/auth/login/otp", { phone, otp, user_type: "customer" }),
  me: () => api.get("/auth/me"),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
};

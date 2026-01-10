import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Use EXPO_PUBLIC_API_URL from .env files
// For Android Emulator, use 10.0.2.2 instead of localhost in your .env.development
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Debug Logging
  console.log(`🚀 [API REQ] ${config.method?.toUpperCase()} ${config.url}`);
  if (config.data)
    console.log("📦 Body:", JSON.stringify(config.data, null, 2));

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API RES] ${response.status} ${response.config.url}`);
    // Optional: Log response data (can be noisy)
    // console.log("DATA:", JSON.stringify(response.data, null, 2));
    return response;
  },
  (error) => {
    console.log(`❌ [API ERR] ${error.config?.url} - ${error.message}`);
    if (error.response) {
      console.log(
        "🔴 Error Data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  requestOTP: (phone) =>
    api.post("/auth/otp/request", { phone, user_type: "customer" }),
  verifyOTP: (phone, otp) =>
    api.post("/auth/login/otp", { phone, otp, user_type: "customer" }),
  checkServiceability: (data) =>
    api.post("/customer/serviceability/check", data),
};

export default api;

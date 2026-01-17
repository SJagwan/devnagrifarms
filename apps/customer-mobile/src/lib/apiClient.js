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

// Refresh handling state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper to mask sensitive fields in request body for logging
const maskSensitiveData = (data) => {
  if (!data || typeof data !== "object") return data;
  const masked = { ...data };
  const sensitiveFields = [
    "password",
    "otp",
    "otp_code",
    "token",
    "refreshToken",
  ];
  sensitiveFields.forEach((field) => {
    if (masked[field]) masked[field] = "***REDACTED***";
  });
  return masked;
};

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Debug Logging (dev only, with sensitive data masked)
  if (__DEV__) {
    console.log(`🚀 [API REQ] ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log(
        "📦 Body:",
        JSON.stringify(maskSensitiveData(config.data), null, 2),
      );
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ [API RES] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const status = error?.response?.status;

    if (__DEV__) {
      console.log(`❌ [API ERR] ${error.config?.url} - ${error.message}`);
      if (error.response) {
        console.log(
          "🔴 Error Data:",
          JSON.stringify(error.response.data, null, 2),
        );
      }
    }

    // If unauthorized, try token refresh once
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue requests while refresh in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken || refreshToken;
        if (!newAccessToken) throw new Error("No access token from refresh");

        // Store new tokens
        await SecureStore.setItemAsync("accessToken", newAccessToken);
        if (newRefreshToken !== refreshToken) {
          await SecureStore.setItemAsync("refreshToken", newRefreshToken);
        }

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Clear tokens - user needs to re-login
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("user");
        // Note: Navigation to login should be handled by AuthContext
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
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

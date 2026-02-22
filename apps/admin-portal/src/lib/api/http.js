import axios from "axios";
import { toast } from "../../components/ui/Toaster";
import { API_BASE_URL } from "../config";
import { getAccessToken, getRefreshToken, setTokens, clearAuth } from "../auth";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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

// Attach access token on requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for refresh + normalization
api.interceptors.response.use(
  (res) => {
    const successMessage = res?.config?.meta?.successMessage;
    // Success toast strategy:
    // - If meta.suppressSuccess: do nothing
    // - Else if meta.successMessage: show it
    // - Else for non-GET requests, if backend provides data.message, show it
    const meta = res?.config?.meta || {};
    if (!meta.suppressSuccess) {
      const method = (res?.config?.method || "get").toLowerCase();
      const backendMsg = res?.data?.message;
      if (meta.successMessage) {
        toast.success(meta.successMessage);
      } else if (method !== "get" && backendMsg) {
        toast.success(backendMsg);
      }
    }
    return res;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const status = error?.response?.status;

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
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken || refreshToken;
        if (!newAccessToken) throw new Error("No access token from refresh");

        setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuth();
        // Hard redirect to login to reset app state
        if (typeof window !== "undefined") {
          window.location.assign("/login");
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error
    const normalized = {
      status: status || 0,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Unexpected error, please try again.",
      data: error?.response?.data || null,
    };

    // Toast error globally
    try {
      toast.error(normalized.message);
    } catch {}
    return Promise.reject(normalized);
  }
);

export default api;

import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../lib/api/requests";
import {
  setTokens,
  setUser as storeUser,
  getUser,
  clearAuth,
  getAccessToken,
} from "../lib/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const token = getAccessToken();
      const cached = getUser();
      if (cached) setUser(cached);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authAPI.me();
        if (!mounted) return;
        if (data?.user) {
          storeUser(data.user);
          setUser(data.user);
        }
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401 || status === 403) {
          clearAuth();
          if (mounted) setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    hydrate();

    // Cross-tab auth sync
    const onStorage = (e) => {
      if (e.key === "accessToken" || e.key === "user") {
        const u = getUser();
        setUser(u);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({
        email,
        password,
        user_type: "admin",
      });

      // Store tokens and user data
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      storeUser(data.user);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      const message = error?.message || "Login failed";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

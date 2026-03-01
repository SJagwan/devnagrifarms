import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { authAPI } from "../lib/api/auth.api";

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userJson = await SecureStore.getItemAsync("user");
      const token = await SecureStore.getItemAsync("accessToken");
      if (userJson && token) {
        setUser(JSON.parse(userJson));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, tokens) => {
    await SecureStore.setItemAsync("user", JSON.stringify(userData));
    await SecureStore.setItemAsync("accessToken", tokens.accessToken);
    if (tokens.refreshToken) {
      await SecureStore.setItemAsync("refreshToken", tokens.refreshToken);
    }
    setUser(userData);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.me();
      if (res.data && res.data.user) {
        setUser(res.data.user);
        await SecureStore.setItemAsync("user", JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (e) {
      console.error("Failed to refresh user profile", e);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

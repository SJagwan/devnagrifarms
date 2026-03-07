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
  const [hasCheckedLocation, setHasCheckedLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userJson = await SecureStore.getItemAsync("user");
      const token = await SecureStore.getItemAsync("accessToken");
      const locationJson = await SecureStore.getItemAsync("selectedLocation");
      
      if (locationJson) {
        setSelectedLocation(JSON.parse(locationJson));
        setHasCheckedLocation(true);
      }

      if (userJson && token) {
        const userData = JSON.parse(userJson);
        setUser(userData);
        
        // If no session location, use profile default
        if (!locationJson && userData.default_address) {
          const address = userData.default_address;
          setSelectedLocation({
            address_line1: address.address_line_1, // Note: backend uses snake_case model fields
            city: address.city,
            type: address.address_type || "Home",
            pincode: address.zip_code
          });
          setHasCheckedLocation(true);
        }
        
        refreshUser();
      }
    } catch (e) {
      console.error("Auth check failed:", e);
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

    // Auto-select location from default_address if no session exists
    const locationJson = await SecureStore.getItemAsync("selectedLocation");
    if (!locationJson && userData.default_address) {
      const address = userData.default_address;
      await saveLocation({
        address_line1: address.address_line_1,
        city: address.city,
        type: address.address_type || "Home",
        pincode: address.zip_code
      });
    }
  };

  const logout = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync("user"),
      SecureStore.deleteItemAsync("accessToken"),
      SecureStore.deleteItemAsync("refreshToken"),
      SecureStore.deleteItemAsync("hasCheckedLocation"),
      SecureStore.deleteItemAsync("selectedLocation")
    ]);
    setUser(null);
    setHasCheckedLocation(false);
    setSelectedLocation(null);
  };

  const setLocationChecked = async (status) => {
    if (status) {
      await SecureStore.setItemAsync("hasCheckedLocation", "true");
    } else {
      await SecureStore.deleteItemAsync("hasCheckedLocation");
      await SecureStore.deleteItemAsync("selectedLocation");
      setSelectedLocation(null);
    }
    setHasCheckedLocation(status);
  };

  const saveLocation = async (location) => {
    if (!location) return;
    const { raw, ...locationToSave } = location;
    await SecureStore.setItemAsync("selectedLocation", JSON.stringify(locationToSave));
    setSelectedLocation(locationToSave);
    setHasCheckedLocation(true);
    await SecureStore.setItemAsync("hasCheckedLocation", "true");
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.me();
      if (res.data?.user) {
        const freshUser = res.data.user;
        setUser(freshUser);
        await SecureStore.setItemAsync("user", JSON.stringify(freshUser));
        
        // Sync location if not manually set
        const locationJson = await SecureStore.getItemAsync("selectedLocation");
        if (!locationJson && freshUser.default_address) {
          const address = freshUser.default_address;
          setSelectedLocation({
            address_line1: address.address_line_1,
            city: address.city,
            type: address.address_type || "Home",
            pincode: address.zip_code
          });
          setHasCheckedLocation(true);
        }
        return freshUser;
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
        hasCheckedLocation,
        setLocationChecked,
        selectedLocation,
        saveLocation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

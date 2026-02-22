import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartContext = createContext({});

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    saveCart();
  }, [cartItems]);

  const loadCart = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("@cart");
      if (jsonValue != null) {
        setCartItems(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem("@cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  };

  const addToCart = (variant, quantity) => {
    const minQty = variant.min_order_qty || 1;
    const effectiveQty = quantity || minQty;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.variant.id === variant.id
      );

      if (existingItem) {
        const newQty = existingItem.quantity + effectiveQty;
        const maxQty = variant.max_order_qty;
        const clampedQty = maxQty ? Math.min(newQty, maxQty) : newQty;
        return prevItems.map((item) =>
          item.variant.id === variant.id
            ? { ...item, quantity: clampedQty }
            : item
        );
      } else {
        return [...prevItems, { variant, quantity: effectiveQty }];
      }
    });
  };

  const removeFromCart = (variantId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.variant.id !== variantId)
    );
  };

  const updateQuantity = (variantId, newQuantity) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((i) => i.variant.id === variantId);
      if (!item) return prevItems;

      const minQty = item.variant.min_order_qty || 1;
      const maxQty = item.variant.max_order_qty;

      if (newQuantity < minQty) {
        return prevItems.filter((i) => i.variant.id !== variantId);
      }

      const clampedQty = maxQty ? Math.min(newQuantity, maxQty) : newQuantity;
      return prevItems.map((i) =>
        i.variant.id === variantId ? { ...i, quantity: clampedQty } : i
      );
    });
  };

  const clearCart = async () => {
    setCartItems([]);
    await AsyncStorage.removeItem("@cart");
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.variant.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

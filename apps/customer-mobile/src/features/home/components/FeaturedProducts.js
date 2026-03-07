import React from "react";
import { View, Text } from "react-native";
import ProductCard from "../../product-variant/components/ProductCard";

export default function FeaturedProducts({
  products,
  cartItems,
  onAddToCart,
  onRemoveFromCart,
}) {
  // Helper to find quantity in cart
  const getQuantity = (id) => {
    if (Array.isArray(cartItems)) {
      // id here is the variant ID from our HomeScreen mapper
      const item = cartItems.find((ci) => ci.variant.id === id);
      return item ? item.quantity : 0;
    }
    return 0;
  };

  return (
    <View className="px-4 pb-24">
      <Text className="text-xl font-extrabold text-gray-900 mb-5">
        Featured Products
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            quantity={getQuantity(product.id)}
            onAdd={() => onAddToCart(product)}
            onRemove={() => onRemoveFromCart(product.id)}
          />
        ))}
      </View>
    </View>
  );
}

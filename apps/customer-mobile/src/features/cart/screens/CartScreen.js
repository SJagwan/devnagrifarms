import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@context/CartContext";

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } =
    useCart();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Remove all items from your cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearCart },
    ]);
  };

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return "₹0";
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white px-4 py-4 flex-row items-center shadow-sm">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Your Cart</Text>
        </View>
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text className="text-gray-500 mt-4 text-lg text-center font-medium">
            Your cart is empty
          </Text>
          <Text className="text-gray-400 mt-2 text-center">
            Looks like you haven't added anything to your cart yet.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-8 bg-green-600 px-8 py-3 rounded-full"
          >
            <Text className="text-white font-bold text-lg">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-4 flex-row items-center shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          Your Cart ({cartItems.length})
        </Text>
        <TouchableOpacity onPress={handleClearCart} className="ml-auto">
          <Text className="text-red-500 font-medium">Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {cartItems.map((item) => {
          const minQty = item.variant.min_order_qty || 1;
          const maxQty = item.variant.max_order_qty;
          const lineTotal = (item.variant.price * item.quantity).toFixed(2);
          const atMin = item.quantity <= minQty;
          const atMax = maxQty && item.quantity >= maxQty;

          return (
            <View
              key={item.variant.id}
              className="bg-white rounded-xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row">
                {/* Image */}
                <View className="w-20 h-20 bg-gray-200 rounded-lg mr-4 items-center justify-center">
                  {item.variant.images && item.variant.images.length > 0 ? (
                    <Image
                      source={{ uri: item.variant.images[0].url }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="image-outline" size={24} color="gray" />
                  )}
                </View>

                <View className="flex-1 justify-between">
                  <View>
                    <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>
                      {item.variant.product?.name || "Product"}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {item.variant.quantity} {item.variant.unit}
                      {item.variant.sku ? ` • ${item.variant.sku}` : ""}
                    </Text>
                  </View>

                  <Text className="text-green-700 font-semibold text-sm">
                    {formatPrice(item.variant.price)}/{item.variant.unit || "pc"}
                  </Text>
                </View>
              </View>

              {/* Quantity & Line Total */}
              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <View className="flex-row items-center bg-gray-100 rounded-lg">
                  <TouchableOpacity
                    onPress={() => {
                      if (atMin) {
                        Alert.alert("Remove Item", "Remove this item from cart?", [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Remove",
                            style: "destructive",
                            onPress: () => removeFromCart(item.variant.id),
                          },
                        ]);
                      } else {
                        updateQuantity(item.variant.id, item.quantity - 1);
                      }
                    }}
                    className="p-2"
                  >
                    <Ionicons
                      name={atMin ? "trash-outline" : "remove"}
                      size={20}
                      color={atMin ? "#EF4444" : "black"}
                    />
                  </TouchableOpacity>
                  <Text className="font-bold w-8 text-center">
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.variant.id, item.quantity + 1)}
                    disabled={atMax}
                    className="p-2"
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={atMax ? "#9CA3AF" : "black"}
                    />
                  </TouchableOpacity>
                </View>

                <Text className="font-bold text-gray-900 text-lg">
                  ₹{lineTotal}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className="bg-white p-4 shadow-lg rounded-t-3xl border-t border-gray-100">
        <View className="flex-row justify-between mb-4">
          <Text className="text-gray-500 text-lg">Total Amount</Text>
          <Text className="text-xl font-bold text-gray-900">
            ₹{cartTotal.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          className="bg-green-600 py-4 rounded-xl items-center shadow-md"
        >
          <Text className="text-white font-bold text-xl">Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

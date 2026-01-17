import React from "react";
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";

// Reusable Animated Pressable Component
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ProductCard({
  product,
  onAdd,
  onRemove,
  quantity = 0,
  index = 0,
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).springify()}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden w-[48%] mb-5"
      style={[
        {
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
      ]}
    >
      <View className="h-36 bg-gray-50 relative">
        <Image
          source={{ uri: product.image }}
          className="w-full h-full object-cover"
          resizeMode="cover"
        />
        {product.discount > 0 && (
          <View className="absolute top-2 left-2 bg-red-500 px-2.5 py-1 rounded-full shadow-sm">
            <Text className="text-white text-[10px] font-bold tracking-wide">
              {product.discount}% OFF
            </Text>
          </View>
        )}
      </View>

      <View className="p-3.5">
        <Text
          className="text-gray-900 font-bold text-sm h-9 leading-4"
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <Text className="text-gray-500 text-xs mt-1 font-medium">
          {product.weight}
        </Text>

        <View className="flex-row items-center mt-3 space-x-2">
          <Text className="text-primary font-extrabold text-base">
            ₹{product.price}
          </Text>
          {product.originalPrice && (
            <Text className="text-gray-400 text-xs line-through font-medium">
              ₹{product.originalPrice}
            </Text>
          )}
        </View>

        <View className="mt-3">
          {quantity === 0 ? (
            <AnimatedPressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={onAdd}
              style={animatedStyle}
              className="bg-primary/10 py-2.5 rounded-xl border border-primary/20 flex-row justify-center items-center"
            >
              <Text className="text-primary text-xs font-bold uppercase tracking-wider">
                Add to Cart
              </Text>
            </AnimatedPressable>
          ) : (
            <View className="flex-row items-center justify-between bg-primary rounded-xl py-1.5 px-3">
              <TouchableOpacity onPress={onRemove} hitSlop={10}>
                <Ionicons name="remove" size={18} color="white" />
              </TouchableOpacity>
              <Text className="text-white font-bold text-sm mx-2">
                {quantity}
              </Text>
              <TouchableOpacity onPress={onAdd} hitSlop={10}>
                <Ionicons name="add" size={18} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

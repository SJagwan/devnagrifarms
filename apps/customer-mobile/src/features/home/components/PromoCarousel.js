import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  Pressable,
  Animated as RNAnimated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width - 32;
const ITEM_SPACING = 16;

const BANNERS = [
  {
    id: "1",
    title: "Fresh Harvest",
    subtitle: "Up to 30% OFF on Organic Vegetables",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    cta: "Shop Now",
    gradient: ["transparent", "rgba(22, 163, 74, 0.9)"], // Green tint
  },
  {
    id: "2",
    title: "Farm to Home",
    subtitle: "Free Delivery on orders above ₹499",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80",
    cta: "Explore",
    gradient: ["transparent", "rgba(245, 158, 11, 0.9)"], // Amber tint
  },
  {
    id: "3",
    title: "Dairy Delights",
    subtitle: "Fresh A2 Milk & Artisanal Cheese",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80",
    cta: "Subscribe",
    gradient: ["transparent", "rgba(37, 99, 235, 0.9)"], // Blue tint
  },
];

export default function PromoCarousel({ onBannerPress }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new RNAnimated.Value(0)).current;
  
  // Auto-scroll logic
  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= BANNERS.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * (ITEM_WIDTH + ITEM_SPACING),
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const onScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false, // width interpolation doesn't support native driver
      listener: (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        if (roundIndex !== currentIndex && roundIndex >= 0 && roundIndex < BANNERS.length) {
          setCurrentIndex(roundIndex);
        }
      },
    }
  );

  const renderItem = ({ item }) => {
    return (
      <Pressable onPress={() => onBannerPress?.(item)}>
        <View
          style={{ width: ITEM_WIDTH, marginRight: ITEM_SPACING }}
          className="rounded-[28px] overflow-hidden bg-white shadow-sm h-56 border border-gray-100"
        >
          {/* Background Image */}
          <View className="absolute inset-0 z-0">
            <Image
              source={{ uri: item.image }}
              className="w-full h-full object-cover"
            />
            {/* Elegant Gradient Overlay */}
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0, y: 1 }}
              className="absolute inset-0"
            />
          </View>

          {/* Content */}
          <View className="p-6 h-full justify-end z-10 pb-5">
            <View className="flex-row justify-between items-end">
              <View className="flex-1 mr-4">
                <Text className="text-white text-3xl font-black tracking-tight shadow-sm mb-1">
                  {item.title}
                </Text>
                <Text className="text-white/95 text-xs font-semibold tracking-wide">
                  {item.subtitle}
                </Text>
              </View>

              {/* Elevated CTA Button */}
              <View className="bg-white px-4 py-2.5 rounded-full flex-row items-center shadow-lg transform translate-y-1">
                <Text className="text-gray-900 font-extrabold text-xs tracking-wider mr-1">
                  {item.cta}
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#111827" />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="mb-2 mt-2">
      <RNAnimated.FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
      
      {/* Animated Pagination Indicators */}
      <View className="flex-row justify-center mt-5 mb-2 h-2 items-center">
        {BANNERS.map((_, i) => {
          const inputRange = [
            (i - 1) * (ITEM_WIDTH + ITEM_SPACING),
            i * (ITEM_WIDTH + ITEM_SPACING),
            (i + 1) * (ITEM_WIDTH + ITEM_SPACING),
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [6, 20, 6],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <RNAnimated.View
              key={i}
              style={{
                width: dotWidth,
                opacity,
              }}
              className="h-1.5 mx-1 rounded-full bg-green-600"
            />
          );
        })}
      </View>
    </View>
  );
}

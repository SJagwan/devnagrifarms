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

import { api } from "../../../lib/api";
import { getPublicImageUrl } from "../../../lib/storage";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width - 32;
const ITEM_SPACING = 16;

export default function PromoCarousel({ onBannerPress }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await api.get("/public/banners", {
        params: { position: "HOME_CAROUSEL" }
      });
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-scroll logic
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= banners.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * (ITEM_WIDTH + ITEM_SPACING),
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, banners.length]);

  const onScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false, // width interpolation doesn't support native driver
      listener: (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        if (!slideSize) return;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        if (roundIndex !== currentIndex && roundIndex >= 0 && roundIndex < banners.length) {
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
              source={{ uri: getPublicImageUrl(item.image_url) }}
              className="w-full h-full object-cover"
            />
            {/* Elegant Gradient Overlay - Standard dark tint for readability */}
            <LinearGradient
              colors={["transparent", "rgba(0, 0, 0, 0.5)"]}
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
                  {item.cta_text || "Shop Now"}
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#111827" />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading || banners.length === 0) {
    return null; // or a skeleton loader
  }

  return (
    <View className="mb-2 mt-2">
      <RNAnimated.FlatList
        ref={flatListRef}
        data={banners}
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
        {banners.map((_, i) => {
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

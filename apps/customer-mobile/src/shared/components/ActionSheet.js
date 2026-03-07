import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * A reusable, premium bottom Action Sheet component.
 * 
 * @param {boolean} visible - Whether the action sheet is visible.
 * @param {function} onClose - Function to call to close the action sheet.
 * @param {string} title - Optional title to display at the top.
 * @param {Array} options - Array of option objects: { label, icon, destructive, onPress }
 */
export default function ActionSheet({ visible, onClose, title, options = [] }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Semi-transparent backdrop */}
        <Pressable
          className="absolute inset-0 bg-black/40"
          onPress={onClose}
        />

        {/* Bottom Sheet Container */}
        <View
          className="bg-white rounded-t-3xl overflow-hidden shadow-2xl"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          {/* Drag Handle & Title */}
          <View className="items-center pt-4 pb-2">
            <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-4" />
            {title && (
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-6 text-center">
                {title}
              </Text>
            )}
          </View>

          {/* Options List */}
          <View className="px-4 pb-2">
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  // Allow the modal close animation to start before firing the action
                  setTimeout(() => {
                    if (option.onPress) option.onPress();
                  }, 150);
                }}
                className="py-4 flex-row items-center border-gray-100"
                style={{
                  borderBottomWidth: index === options.length - 1 ? 0 : 1,
                }}
              >
                {option.icon && (
                  <View
                    className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                      option.destructive ? "bg-red-50" : "bg-gray-50"
                    }`}
                  >
                    <Ionicons
                      name={option.icon}
                      size={22}
                      color={option.destructive ? "#EF4444" : "#4B5563"}
                    />
                  </View>
                )}
                <View className="flex-1">
                  <Text
                    className={`text-base font-bold ${
                      option.destructive ? "text-red-500" : "text-gray-900"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {option.description && (
                     <Text className="text-xs text-gray-500 mt-0.5">
                       {option.description}
                     </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Close / Cancel Button */}
          <View className="px-4 mt-2 mb-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              className="py-4 rounded-2xl items-center bg-gray-100"
            >
              <Text className="text-base font-bold text-gray-700">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

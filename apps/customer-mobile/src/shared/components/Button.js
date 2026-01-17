import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { styled } from "nativewind";

export default function Button({
  onPress,
  title,
  loading = false,
  disabled = false,
  variant = "primary",
  className = "",
}) {
  const baseStyle = "py-3 rounded-lg flex-row justify-center items-center";
  const variants = {
    primary: "bg-green-600",
    outline: "bg-transparent border border-green-600",
    secondary: "bg-gray-200",
    danger: "bg-transparent border border-red-500",
  };

  const textStyle = {
    primary: "text-white font-semibold text-lg",
    outline: "text-green-600 font-semibold text-lg",
    secondary: "text-gray-800 font-semibold text-lg",
    danger: "text-red-500 font-semibold text-lg",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${
        disabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#16a34a" : "white"}
        />
      ) : (
        <Text className={textStyle[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

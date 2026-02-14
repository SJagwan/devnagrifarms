import { Pressable, Text, ActivityIndicator } from "react-native";

const VARIANT_STYLES = {
  primary: { backgroundColor: "#16a34a" },
  outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#16a34a" },
  secondary: { backgroundColor: "#e5e7eb" },
  danger: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#ef4444" },
};

const TEXT_COLORS = {
  primary: "#ffffff",
  outline: "#16a34a",
  secondary: "#1f2937",
  danger: "#ef4444",
};

export default function Button({
  onPress,
  title,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className="py-3 rounded-lg flex-row justify-center items-center"
      style={[
        VARIANT_STYLES[variant],
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#16a34a" : "white"}
        />
      ) : (
        <Text
          className="font-semibold text-lg"
          style={{ color: TEXT_COLORS[variant] }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CenterPin() {
  return (
    <View
      pointerEvents="none"
      className="absolute top-1/2 left-1/2 -ml-3 -mt-6" // 24px wide/high icon, offset by half
    >
      <Ionicons name="location-sharp" size={32} color="#dc2626" />
    </View>
  );
}

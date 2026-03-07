import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CenterPin() {
  const ICON_SIZE = 32;
  
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        marginLeft: -ICON_SIZE / 2,
        marginTop: -ICON_SIZE, // Pin tip should be at center
      }}
    >
      <Ionicons name="location-sharp" size={ICON_SIZE} color="#dc2626" />
    </View>
  );
}

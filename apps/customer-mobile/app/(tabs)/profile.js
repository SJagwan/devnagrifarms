import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../lib/context/AuthContext";
import Button from "../../components/ui/Button";

export default function Profile() {
  const { logout, user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Profile</Text>

      <View className="mb-8">
        <Text className="text-gray-500">Loggged in as</Text>
        <Text className="text-xl font-medium">{user?.phone}</Text>
      </View>

      <Button title="Logout" variant="outline" onPress={logout} />
    </SafeAreaView>
  );
}

import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@context/AuthContext";

/**
 * Higher-order component that protects routes requiring authentication.
 * Usage in route files:
 *
 * import ProtectedRoute from "@shared/components/ProtectedRoute";
 * import ProfileScreen from "@features/profile/screens/ProfileScreen";
 * export default () => <ProtectedRoute><ProfileScreen /></ProtectedRoute>;
 */
export default function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // Render the protected content
  return children;
}

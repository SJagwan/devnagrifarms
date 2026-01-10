// Route: /(tabs)/profile → PROTECTED → @features/profile/screens/ProfileScreen
import ProtectedRoute from "@shared/components/ProtectedRoute";
import ProfileScreen from "@features/profile/screens/ProfileScreen";

export default function ProfileRoute() {
  return (
    <ProtectedRoute>
      <ProfileScreen />
    </ProtectedRoute>
  );
}

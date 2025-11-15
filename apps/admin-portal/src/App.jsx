import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AppToaster from "./components/ui/Toaster";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import MainLayout from "./components/layout/MainLayout";
import { protectedRoutes } from "./routes";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppToaster />
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <PrivateRoute>
                  <MainLayout>
                    <route.element />
                  </MainLayout>
                </PrivateRoute>
              }
            />
          ))}

          {/* Redirect any unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

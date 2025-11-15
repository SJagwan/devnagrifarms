import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4">
            <span className="text-4xl">🌾</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DevnagriFarms</h1>
          <p className="text-gray-600 mt-2">Admin Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              className="mb-4"
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@devnagrifarms.com"
              required
              autoComplete="email"
            />

            <TextField
              className="mb-6"
              label="Password"
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-end mb-6">
              <a
                href="#"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" fullWidth isLoading={loading}>
              Sign In
            </Button>
          </form>

          {/* Removed extra links to keep focus on login */}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>&copy; 2025 DevnagriFarms. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

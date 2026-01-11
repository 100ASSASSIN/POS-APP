import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }: any) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    {/* Animated spinner */}
    <div className="w-16 h-16 border-4 border-primary border-dashed rounded-full animate-spin mb-6"></div>

    {/* Main text */}
    <h1 className="text-2xl font-semibold text-gray-800 mb-2">Checking session...</h1>

    {/* Optional subtitle */}
    <p className="text-gray-500 text-sm">
      Please wait while we verify your account and load your dashboard.
    </p>
  </div> // CRITICAL;
  }


  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

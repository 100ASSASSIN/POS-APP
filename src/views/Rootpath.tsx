import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RootPath = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Not logged in → go to login
    if (!isAuthenticated) {
      navigate(user.default_role_route, { replace: true });
      return;
    }

    // Logged in → go to role default route
    if (user?.default_role_route) {
      navigate(user.default_role_route, { replace: true });
    } else {
      // Fallback safety route
      navigate(user.default_role_route, { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  return null; // no UI, redirect-only page
};

export default RootPath;

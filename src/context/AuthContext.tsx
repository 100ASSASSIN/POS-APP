import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/services/axios";

interface AuthContextType {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>; // Function to refresh user data
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user from API
  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get("/me", { withCredentials: true });
      setUser(res.data); // Set user from API response
    } catch (err) {
      setUser(null); // Clear user on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Compute authentication status
  const isAuthenticated = !!user;


  // Show loading screen while checking session
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-primary border-dashed rounded-full animate-spin mb-6"></div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Checking session...
        </h1>
        <p className="text-gray-500 text-sm">
          Please wait while we verify your account and load your dashboard.
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated,
        refreshUser: fetchUser, // Add refresh function to context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used inside an AuthProvider");
  return context;
};

import { useState, useEffect  } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { useNavigate } from "react-router";
import api from "../../../utils/services/axios";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/AuthContext";


const AuthLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, refreshUser } = useAuth();

useEffect(() => {
  if (isAuthenticated && user?.default_role_route) {
    navigate(user.default_role_route, { replace: true });
  }
}, [isAuthenticated, user, navigate]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // --- Input Validations ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    if (password.length > 20) {
      toast.error("Password cannot exceed 20 characters.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/login", { email, password }, { withCredentials: true });

      // Immediately refresh user context
      await refreshUser();

      // Show success toast
      toast.success("successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });

      // Navigate to dashboard
      navigate(user.default_role_route, { replace: true });
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred. Please try again.";

      // Show error toast
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-lg bg-white p-2">
        <div className="mb-4">
          <Label htmlFor="email" className="font-bold">
            Email <span className="text-red-800">*</span>
          </Label>

          <TextInput
            id="email"
            type="email"
            sizing="md"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-rounded-sm mt-2"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="password" className="font-bold">
            Password <span className="text-red-800">*</span>
          </Label>

          <TextInput
            id="password"
            type="password"
            sizing="md"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-rounded-sm mt-2"
          />
        </div>

        <Button type="submit" color="primary" className="w-full rounded-xl" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

      <div className="font-light text-primary text-xs text-center break-words">
        &copy; Powered by Austronix Unity Enterprises Pvt. Ltd.
      </div>
    </>
  );
};

export default AuthLogin;

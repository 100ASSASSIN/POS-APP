import { useState } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { useNavigate } from "react-router";
import api from "../../../utils/services/axios";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });

      // Show success toast
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });

      // Redirect after a short delay to allow toast to show
      setTimeout(() => {
        navigate("/");
      }, 500);
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
        progress: undefined,
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

      {/* ToastContainer must be included once in your app */}
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


import FullLogo from "src/layouts/full/shared/logo/FullLogo";
import AuthLogin from "../authforms/AuthLogin";

const gradientStyle = {
  background: "linear-gradient(45deg, rgb(238, 119, 82,0.2), rgb(231, 60, 126,0.2), rgb(35, 166, 213,0.2), rgb(35, 213, 171,0.2))",
  backgroundSize: "400% 400%",
  animation: "gradient 4s ease infinite",
  height: "100vh",
};

const Login = () => {
  return (
    <div style={gradientStyle} className="relative overflow-hidden h-screen xs:p-0">
      <div className="flex h-full justify-center items-center px-4">
        <div className="rounded-sm shadow-md bg-white dark:bg-darkgray p-6 w-full md:w-96 border-none">
          <div className="flex flex-col gap-2 p-0 w-full">
            <div className="mx-auto">
              <FullLogo />
            </div>
            <p className="text-sm text-center text-dark my-3 font-semibold">
              Sign In on POS
            </p>
            <AuthLogin />
            <p className="text-xs text-center text-gray-500 mb-4">
              Please enter your email and password to access your Point of Sale dashboard. Make sure your credentials are correct.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./css/globals.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <Suspense>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Suspense>
);

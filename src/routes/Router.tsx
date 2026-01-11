import { lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";

/* Layouts */
const FullLayout = lazy(() => import("../layouts/full/FullLayout"));
const BlankLayout = lazy(() => import("../layouts/blank/BlankLayout"));

/* Pages */
const Dashboard = lazy(() => import("../views/dashboards/Dashboard"));
const RootPath = lazy(() => import("../views/Rootpath"));
const Login = lazy(() => import("../views/auth/login/Login"));
const Error = lazy(() => import("../views/auth/error/Error"));

const Router = [
  {
    path: "/",
    element: <FullLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <RootPath />
          </ProtectedRoute>
        ),
      },

      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <RoleGuard allowedRoles={["admin"]}>
              <Dashboard />
            </RoleGuard>
          </ProtectedRoute>
        ),
      },

      {
        path: "manager",
        element: (
          <ProtectedRoute>
            <RoleGuard allowedRoles={["admin", "manager"]}>
              <Dashboard />
            </RoleGuard>
          </ProtectedRoute>
        ),
      },

      {
        path: "cashier",
        element: (
          <ProtectedRoute>
            <RoleGuard allowedRoles={["cashier"]}>
              <Dashboard />
            </RoleGuard>
          </ProtectedRoute>
        ),
      },

      { path: "*", element: <Navigate to="/auth/404" replace /> },
    ],
  },

  {
    path: "/",
    element: <BlankLayout />,
    children: [
      { path: "auth/login", element: <Login /> },
      { path: "auth/404", element: <Error /> },
      { path: "*", element: <Navigate to="/auth/404" replace /> },
    ],
  },
];

export default createBrowserRouter(Router);

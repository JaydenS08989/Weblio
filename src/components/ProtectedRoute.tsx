import type React from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/store";

const ProtectedRoute: React.FC = () => {
  return useAuthStore((state) => state.isAuthenticated) ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/sign-in" replace />
  );
};

export default ProtectedRoute;

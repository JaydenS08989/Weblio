import React, { Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthPage, DashboardPage, EditorPage, PreviewPage } from "@/components";
import { useAuthStore } from "@/store";

const ProtectedRoute: React.FC = () =>
  useAuthStore((state) => state.isAuthenticated) ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/sign-in" replace />
  );
const App: React.FC = () => (
  <Suspense
    fallback={<div className="route-loading">Preparing your workspace…</div>}
  >
    <Routes>
      <Route path="/auth/sign-in" element={<AuthPage mode="sign-in" />} />
      <Route path="/auth/sign-up" element={<AuthPage mode="sign-up" />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
        <Route path="/preview/:projectId" element={<PreviewPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);
export default App;

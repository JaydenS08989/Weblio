import type React from "react";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components";

const AuthPage = lazy(() =>
  import("@/pages").then(({ AuthPage }) => ({ default: AuthPage })),
);
const DashboardPage = lazy(() =>
  import("@/pages").then(({ DashboardPage }) => ({ default: DashboardPage })),
);
const EditorPage = lazy(() =>
  import("@/pages").then(({ EditorPage }) => ({ default: EditorPage })),
);
const PreviewPage = lazy(() =>
  import("@/pages").then(({ PreviewPage }) => ({ default: PreviewPage })),
);

const App: React.FC = () => {
  return (
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
};

export default App;

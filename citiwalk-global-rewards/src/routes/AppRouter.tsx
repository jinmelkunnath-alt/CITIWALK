import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PortalLayout, PublicLayout } from "@/components/layout";
import { Loader } from "@/components/ui";
import { routePaths } from "@/routes/paths";

const HomePage = lazy(() => import("@/pages/HomePage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const OfficialRulesPage = lazy(() => import("@/pages/OfficialRulesPage"));
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function RouteFallback() {
  return (
    <div className="grid min-h-[55vh] place-items-center" aria-label="Loading page">
      <Loader size="lg" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path={routePaths.terms} element={<TermsPage />} />
          <Route path={routePaths.privacy} element={<PrivacyPage />} />
          <Route path={routePaths.rules} element={<OfficialRulesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin" element={<PortalLayout />}>
          <Route index element={<Navigate to={routePaths.adminLogin} replace />} />
          <Route path="login" element={<AdminLoginPage />} />
        </Route>

        <Route element={<PortalLayout />}>
          <Route path={routePaths.dashboard} element={<DashboardPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

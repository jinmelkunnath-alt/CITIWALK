import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PortalLayout, PublicLayout } from "@/components/layout";
import { PageLoader } from "@/components/ui";
import { routePaths } from "@/routes/paths";

const HomePage = lazy(() => import("@/pages/HomePage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const OfficialRulesPage = lazy(() => import("@/pages/OfficialRulesPage"));
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const AdminParticipantsPage = lazy(() => import("@/pages/AdminParticipantsPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/AdminAnalyticsPage"));
const AdminWinnersPage = lazy(() => import("@/pages/AdminWinnersPage"));
const AdminSettingsPage = lazy(() => import("@/pages/AdminSettingsPage"));
const AdminLogsPage = lazy(() => import("@/pages/AdminLogsPage"));
const OfflinePage = lazy(() => import("@/pages/OfflinePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function RouteFallback() {
  return <PageLoader label="Loading CITIWALK page" />;
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
          <Route path="/offline" element={<OfflinePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin" element={<PortalLayout />}>
          <Route index element={<Navigate to={routePaths.adminLogin} replace />} />
          <Route path="login" element={<AdminLoginPage />} />
        </Route>

        <Route element={<AdminGuard />}>
          <Route path={routePaths.dashboard} element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="participants" element={<AdminParticipantsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="winners" element={<AdminWinnersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="logs" element={<AdminLogsPage />} />
            <Route path="*" element={<Navigate to={routePaths.dashboard} replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

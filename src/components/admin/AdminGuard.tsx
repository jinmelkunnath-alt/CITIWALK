import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoader } from "@/components/ui";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { routePaths } from "@/routes/paths";

export function AdminGuard() {
  const { admin, initializing } = useAdminAuth();
  const location = useLocation();

  if (initializing) {
    return <PageLoader label="Verifying administrator access" />;
  }

  if (!admin) {
    return (
      <Navigate
        to={routePaths.adminLogin}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}

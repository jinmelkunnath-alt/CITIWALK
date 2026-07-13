import { useState, type FormEvent } from "react";
import { FiLock, FiMail, FiShield } from "react-icons/fi";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import {
  GlassCard,
  Input,
  PrimaryButton,
  StatusBadge,
} from "@/components/ui";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { routePaths } from "@/routes/paths";

type LocationState = { from?: string };

export default function AdminLoginPage() {
  const { admin, login, authenticating } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [attempted, setAttempted] = useState(false);

  if (admin) return <Navigate to={routePaths.dashboard} replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    if (!email.trim() || !password) return;
    const authenticated = await login(email, password);
    if (authenticated) {
      const destination = (location.state as LocationState | null)?.from;
      navigate(destination?.startsWith("/dashboard") ? destination : routePaths.dashboard, {
        replace: true,
      });
    }
  };

  return (
    <>
      <Seo title="Admin Login" path={routePaths.adminLogin} noIndex />
      <GlassCard className="w-full max-w-md p-6 sm:p-9" accent="purple">
        <div className="flex items-start justify-between gap-5">
          <div className="grid size-14 place-items-center rounded-2xl border border-brand-300/20 bg-brand-400/10 text-brand-200 shadow-glow-purple">
            <FiShield className="size-6" aria-hidden="true" />
          </div>
          <StatusBadge variant="purple" dot>Restricted</StatusBadge>
        </div>
        <h1 className="mt-7 text-3xl font-bold tracking-[-0.045em] text-white">Admin Login</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Sign in with an authorized CITIWALK administrator account.
        </p>

        <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@citiwalk.com"
            autoComplete="username"
            leadingIcon={<FiMail className="size-4" />}
            error={attempted && !email.trim() ? "Admin email is required." : undefined}
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            leadingIcon={<FiLock className="size-4" />}
            error={attempted && !password ? "Password is required." : undefined}
          />
          <PrimaryButton
            type="submit"
            size="lg"
            className="w-full"
            isLoading={authenticating}
            leadingIcon={<FiLock className="size-4" aria-hidden="true" />}
          >
            Secure Login
          </PrimaryButton>
        </form>

        <div className="mt-6 rounded-card border border-white/[0.07] bg-white/[0.03] p-4">
          <p className="text-xs font-bold text-white">Security boundary</p>
          <p className="mt-1.5 text-xs leading-5 text-muted">
            Access requires Firebase Email/Password authentication and a server-issued admin custom claim. The authentication layer is prepared for a future MFA challenge.
          </p>
        </div>
      </GlassCard>
    </>
  );
}

import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getFirebaseRuntime, isFirebaseConfigured } from "@/firebase/client";
import { useUI } from "@/hooks/useUI";
import {
  AdminAuthContext,
  type AdminUser,
} from "@/context/admin-auth-context";
import {
  getAdminServiceError,
  logAdminLoginAttempt,
} from "@/services/adminService";
import { createBrowserFingerprint } from "@/services/fingerprintService";
import { trackCampaignEvent } from "@/services/analyticsService";

const ADMIN_LOGIN_THROTTLE_KEY = "citiwalk:admin-login-throttle";
const ADMIN_LOGIN_WINDOW_MS = 15 * 60_000;

function readLoginThrottle() {
  try {
    const value = JSON.parse(
      window.sessionStorage.getItem(ADMIN_LOGIN_THROTTLE_KEY) || "{}",
    ) as { attempts?: number; windowStartedAt?: number; blockedUntil?: number };
    if (
      !value.windowStartedAt ||
      Date.now() - value.windowStartedAt > ADMIN_LOGIN_WINDOW_MS
    ) {
      return { attempts: 0, windowStartedAt: Date.now(), blockedUntil: 0 };
    }
    return {
      attempts: Number(value.attempts || 0),
      windowStartedAt: value.windowStartedAt,
      blockedUntil: Number(value.blockedUntil || 0),
    };
  } catch {
    return { attempts: 0, windowStartedAt: Date.now(), blockedUntil: 0 };
  }
}

function recordFailedLoginLocally() {
  const current = readLoginThrottle();
  const attempts = current.attempts + 1;
  window.sessionStorage.setItem(
    ADMIN_LOGIN_THROTTLE_KEY,
    JSON.stringify({
      attempts,
      windowStartedAt: current.windowStartedAt,
      blockedUntil:
        attempts >= 5 ? Date.now() + ADMIN_LOGIN_WINDOW_MS : current.blockedUntil,
    }),
  );
}

function clearLoginThrottle() {
  window.sessionStorage.removeItem(ADMIN_LOGIN_THROTTLE_KEY);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { addToast } = useUI();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setInitializing(false);
      return;
    }

    let unsubscribe: () => void = () => undefined;
    let active = true;
    void getFirebaseRuntime()
      .then(({ auth }) => {
        if (!active) return;
        unsubscribe = onIdTokenChanged(auth, async (user) => {
          if (!active) return;
          if (!user) {
            setAdmin(null);
            setInitializing(false);
            return;
          }
          const token = await user.getIdTokenResult();
          if (token.claims.admin === true && user.email) {
            setAdmin({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email.split("@")[0],
            });
          } else {
            setAdmin(null);
          }
          setInitializing(false);
        });
      })
      .catch(() => {
        if (active) setInitializing(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!isFirebaseConfigured) {
        addToast({
          tone: "error",
          title: "Firebase is not configured",
          message: "Add the Firebase Web App environment values before admin login.",
        });
        return false;
      }

      const throttle = readLoginThrottle();
      if (throttle.blockedUntil > Date.now()) {
        const minutes = Math.ceil((throttle.blockedUntil - Date.now()) / 60_000);
        addToast({
          tone: "warning",
          title: "Login temporarily limited",
          message: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        });
        return false;
      }

      setAuthenticating(true);
      try {
        const { auth } = await getFirebaseRuntime();
        const credential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        const token = await credential.user.getIdTokenResult(true);
        if (token.claims.admin !== true || !credential.user.email) {
          recordFailedLoginLocally();
          await createBrowserFingerprint()
            .then((fingerprint) => logAdminLoginAttempt(email, false, fingerprint))
            .catch(() => undefined);
          await signOut(auth);
          addToast({
            tone: "error",
            title: "Administrator access denied",
            message: "This account does not have the required admin claim.",
          });
          return false;
        }

        setAdmin({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName:
            credential.user.displayName || credential.user.email.split("@")[0],
        });
        clearLoginThrottle();
        await createBrowserFingerprint()
          .then((fingerprint) => logAdminLoginAttempt(email, true, fingerprint))
          .catch(() => undefined);
        void trackCampaignEvent("admin_login");
        addToast({ tone: "success", title: "Welcome back", message: "Secure admin session established." });
        return true;
      } catch (error: unknown) {
        recordFailedLoginLocally();
        await createBrowserFingerprint()
          .then((fingerprint) => logAdminLoginAttempt(email, false, fingerprint))
          .catch(() => undefined);
        const adminError = getAdminServiceError(error);
        const firebaseCode = (error as { code?: string }).code;
        addToast({
          tone: "error",
          title:
            firebaseCode === "auth/multi-factor-auth-required"
              ? "Additional verification required"
              : "Admin login failed",
          message:
            firebaseCode === "auth/multi-factor-auth-required"
              ? "This account requires MFA. The authentication boundary is ready for a future MFA challenge screen."
              : adminError.message.includes("Firebase")
                ? adminError.message
                : "Check your email and password, then try again.",
        });
        return false;
      } finally {
        setAuthenticating(false);
      }
    },
    [addToast],
  );

  const logout = useCallback(async () => {
    const { auth } = await getFirebaseRuntime();
    await signOut(auth);
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ admin, initializing, authenticating, login, logout }),
    [admin, authenticating, initializing, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

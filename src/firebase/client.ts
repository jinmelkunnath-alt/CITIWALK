import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
  signInAnonymously,
  type Auth,
} from "firebase/auth";
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredConfiguration = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export const isFirebaseConfigured = requiredConfiguration.every(
  (value) => typeof value === "string" && value.trim().length > 0,
);

export const firebaseFunctionsRegion =
  import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || "asia-south1";

export type FirebaseRuntime = {
  app: FirebaseApp;
  auth: Auth;
  functions: Functions;
};

let runtimePromise: Promise<FirebaseRuntime> | null = null;
let emulatorsConnected = false;
let appCheckInitialized = false;

async function initializeRuntime(): Promise<FirebaseRuntime> {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Add the VITE_FIREBASE_* values from .env.example.",
    );
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const functions = getFunctions(app, firebaseFunctionsRegion);

  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true" && !emulatorsConnected) {
    const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || "127.0.0.1";
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFunctionsEmulator(functions, host, 5001);
    emulatorsConnected = true;
  }

  const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
  if (appCheckSiteKey && !appCheckInitialized) {
    const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import(
      "firebase/app-check"
    );
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
    appCheckInitialized = true;
  }

  await setPersistence(auth, browserLocalPersistence);
  await auth.authStateReady();
  return { app, auth, functions };
}

export async function getFirebaseRuntime() {
  runtimePromise ??= initializeRuntime().catch((error: unknown) => {
    runtimePromise = null;
    throw error;
  });
  const runtime = await runtimePromise;
  if (!runtime.auth.currentUser) await signInAnonymously(runtime.auth);
  return runtime;
}

export function getFirebaseConfig() {
  return firebaseConfig;
}

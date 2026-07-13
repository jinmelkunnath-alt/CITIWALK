import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseEnv(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [
          line.slice(0, index),
          line.slice(index + 1).replace(/^['"]|['"]$/g, ""),
        ];
      }),
  );
}

const root = process.cwd();
const productionFile = resolve(root, ".env.production");
const fileValues = existsSync(productionFile)
  ? parseEnv(readFileSync(productionFile, "utf8"))
  : {};
const env = { ...fileValues, ...process.env };
const required = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_MEASUREMENT_ID",
  "VITE_FIREBASE_APPCHECK_SITE_KEY",
  "VITE_PUBLIC_SITE_URL",
  "VITE_APP_VERSION",
];
const missing = required.filter((key) => !env[key]?.trim());
const invalid = [];
if (env.VITE_PUBLIC_SITE_URL?.includes("YOURDOMAIN.COM")) {
  invalid.push("VITE_PUBLIC_SITE_URL");
}
if (env.VITE_FIREBASE_PROJECT_ID?.includes("YOUR_FIREBASE")) {
  invalid.push("VITE_FIREBASE_PROJECT_ID");
}
if (
  env.VITE_PUBLIC_SITE_URL &&
  !env.VITE_PUBLIC_SITE_URL.startsWith("https://")
) {
  invalid.push("VITE_PUBLIC_SITE_URL (must use HTTPS)");
}

const firebaseRcPath = resolve(root, ".firebaserc");
let projectId = "";
if (!existsSync(firebaseRcPath)) {
  missing.push(".firebaserc");
} else {
  try {
    projectId = JSON.parse(readFileSync(firebaseRcPath, "utf8")).projects?.default || "";
    if (!projectId || projectId.includes("YOUR_FIREBASE_PROJECT_ID")) {
      invalid.push(".firebaserc default project");
    }
  } catch {
    invalid.push(".firebaserc JSON");
  }
}

if (projectId && !projectId.includes("YOUR_")) {
  const functionEnvPath = resolve(root, `functions/.env.${projectId}`);
  if (!existsSync(functionEnvPath)) {
    missing.push(`functions/.env.${projectId}`);
  } else {
    const functionEnv = parseEnv(readFileSync(functionEnvPath, "utf8"));
    if (
      !functionEnv.PUBLIC_SITE_URL?.startsWith("https://") ||
      functionEnv.PUBLIC_SITE_URL.includes("YOURDOMAIN.COM")
    ) {
      invalid.push(`${functionEnvPath}: PUBLIC_SITE_URL`);
    }
    if (functionEnv.ENFORCE_APP_CHECK !== "true") {
      invalid.push(`${functionEnvPath}: ENFORCE_APP_CHECK must be true`);
    }
  }
}

if (missing.length || invalid.length) {
  console.error("Production environment validation failed.");
  if (missing.length) console.error(`Missing: ${missing.join(", ")}`);
  if (invalid.length) console.error(`Invalid: ${invalid.join(", ")}`);
  process.exit(1);
}

console.log("Production environment validation passed.");

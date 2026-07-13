function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

let fingerprintPromise: Promise<string> | null = null;

async function generateBrowserFingerprint() {
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
  const signals = [
    navigator.userAgent,
    navigator.language,
    navigator.languages.join(","),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    String(navigator.hardwareConcurrency || 0),
    String(navigatorWithMemory.deviceMemory || 0),
    String(navigator.maxTouchPoints || 0),
    navigator.platform || "unknown",
  ].join("|");

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(signals),
  );
  return toHex(digest);
}

export function createBrowserFingerprint() {
  fingerprintPromise ??= generateBrowserFingerprint().catch((error: unknown) => {
    fingerprintPromise = null;
    throw error;
  });
  return fingerprintPromise;
}

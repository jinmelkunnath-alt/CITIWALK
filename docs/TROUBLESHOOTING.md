# Troubleshooting

## Firebase configuration warning

Confirm all `VITE_FIREBASE_*` values and restart Vite. Production build rejects missing values. Never use Admin SDK credentials in Vite variables.

## `permission-denied` on admin API

- Confirm Email/Password sign-in succeeded.
- Confirm custom claim with Admin SDK.
- Sign out/in to refresh token.
- Verify the call targets the correct project/region.
- Verify App Check token is valid when enforcement is on.

## `unauthenticated` participant call

Enable Anonymous Auth and verify `authDomain`. Check CSP connect/frame sources and blocked browser storage.

## App Check failure

Confirm domain restrictions, Enterprise site key, Firebase App Check registration, client environment, and enforcement metrics. Emulators bypass enforcement through `FUNCTIONS_EMULATOR=true`.

## `resource-exhausted`

The request hit IP/device cooldown or generation limits. Respect `retryAfterSeconds`; do not retry in a loop. Review security logs for abuse.

## Entry number conflict

Expected race behavior. The client calls `prepareEntryNumbers` and displays three fresh values. If repeated, inspect `entryNumbers` status distribution and Function logs.

## Missing Firestore index

Deploy `firestore.indexes.json` and wait until indexes finish building. Required log indexes are documented in the schema guide.

## Emulator requires Java 21

Install JDK 21+, set `JAVA_HOME`, then restart `firebase emulators:start`.

## PWA update appears stale

Use the branded update prompt, or close all tabs and reopen. Verify `sw.js` and HTML use no-cache headers and hashed assets use immutable caching.

## CSP blocks Firebase

Inspect the browser CSP violation. Add only the narrow required Firebase/Google origin to `firebase.json`; never use unrestricted `*` or `unsafe-eval`.

## Excel export is slow

The OOXML writer is intentionally loaded only when `.xlsx` export is requested. Large exports are capped at 10,000 records. Use filtered CSV for faster large extracts.

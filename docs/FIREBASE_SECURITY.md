# Firebase Security Review

## Firestore Rules

`firestore.rules` is deny-by-default. Browser access is denied for:

- `participants`
- `entryNumbers`
- `settings`
- `logs`
- `winnerDraws`
- `rateLimits`
- every unknown collection

Public settings are returned only by a function that selects safe fields. Admin SDK bypass is limited to deployed Cloud Functions and approved operational scripts.

## Storage Rules

Storage is deny-all because the platform has no upload requirement. Do not open Storage until a reviewed path, file-type allowlist, size cap, malware strategy, and owner authorization model exist.

## Authentication

- Participants receive a persistent anonymous Auth session.
- Administrators use Email/Password Authentication.
- Admin route guards improve UX, while server custom-claim checks provide authorization.
- A signed-in non-admin cannot call admin Functions.
- Direct Firestore access remains denied even to an admin token.
- MFA can be added without changing the admin API authorization boundary.

## App Check and bot defense

All Callable Functions enforce App Check by default outside emulators. The Web App initializes `ReCaptchaEnterpriseProvider` when `VITE_FIREBASE_APPCHECK_SITE_KEY` exists.

Production steps:

1. Create a score-based reCAPTCHA Enterprise key restricted to production domains.
2. Register it in Firebase App Check.
3. Monitor App Check metrics.
4. Enforce App Check for Functions and Firebase Authentication.
5. Keep `ENFORCE_APP_CHECK=true`.

## Rate limiting

Server-maintained fixed-window throttles use salted IP hashes and, where available, SHA-256 device fingerprints. Policies protect verification, number generation, registration, destructive admin operations, exports, winner draw, login-event handling, and client error reporting.

Rate-limit documents contain no raw IP and use `expiresAt` TTL. Violations create security logs. Client login cooldown is defense-in-depth; Firebase Auth throttling and reCAPTCHA/App Check remain authoritative.

## Validation and injection defense

- Callable payload byte limits
- Strict object/string/type checks
- E.164 phone parsing and country validation
- Entry number and fingerprint regex validation
- URL, date and email validation
- Markup/control-character rejection for user-controlled plain text
- React escaping; no user HTML rendering
- No dynamic Firestore field paths or client-supplied query operators
- CSV formula neutralization
- User-agent length cap
- Salted IP hashing

The application has no SQL layer. NoSQL injection is prevented by typed, allowlisted request construction.

## Winner security

Winner selection runs only in a custom-claim-protected Function. Node cryptographic randomness performs a Fisher-Yates shuffle. A transaction creates `winnerDraws/official-2026` only if absent. There is no redraw/delete API.

## Secret handling

- `IP_HASH_SALT`: Secret Manager only
- service-account keys: never committed or exposed to Vite
- `.env.production`: deployment secret store/CI variable, not committed
- Firebase Web config: allowed in browser

## Hosting headers

Firebase Hosting config includes CSP, HSTS, frame denial, MIME sniffing prevention, strict referrer policy, restrictive Permissions Policy, and COOP. Test CSP after changing third-party integrations.

# Production Security Audit

Audit scope: React client, Firebase initialization, Authentication, App Check, Callable Functions, Firestore/Storage rules, Hosting headers, PWA cache policy, exports, administrator authorization, winner draw, rate limits, validation, logging, and dependency trees.

## Resolved findings

| Area | Finding | Resolution |
|---|---|---|
| Firestore | Sensitive client access risk | Deny-by-default rules for all sensitive collections; Functions-only access |
| Settings | Direct read could expose update metadata | Direct settings reads denied; whitelisted callable response |
| Admin API | Route guard alone is insufficient | Every admin callable verifies `admin: true` custom claim |
| Bot traffic | Callable abuse | App Check/reCAPTCHA Enterprise enforced by default in production |
| Brute force/abuse | No application throttle | Salted IP and device fixed-window limits, cooldowns, TTL, logs |
| Registration | Race/duplicate risk | Deterministic E.164 document ID and atomic participant/number transaction |
| Entry numbers | Reassignment risk | Assigned/reserved state rejection and no browser writes |
| Winner selection | Client manipulation/replay | Server-only cryptographic reservoir sample and permanent transaction document |
| IP privacy | Raw IP storage | Salted SHA-256 only; raw value never persisted |
| Input injection | Oversized/typed/markup payloads | Byte limits, allowlisted types, regex parsing, markup/control rejection |
| CSV export | Formula injection | Formula-prefix neutralization |
| Browser compromise impact | Weak response headers | CSP, HSTS, frame denial, nosniff, referrer and permissions policies |
| PWA | Sensitive data caching | Static-only runtime cache; POST/API state never cached |
| Errors | Silent crashes | Sanitized client reports, Cloud Logging, friendly 500/network/offline states |
| Dependencies | Runtime advisories | `npm audit --omit=dev`: zero known vulnerabilities in root and Functions trees |

## Verification performed

- TypeScript compilation: frontend and Functions
- ESLint with zero warnings
- Production invariant tests
- Participant emulator flow including direct-rule denial, attempt sequences, conflict, duplicate, and Entry ID
- Admin emulator flow including custom-claim denial, list/details, analytics, settings, draw, export, delete
- Admin logs endpoint smoke test
- Firebase Hosting emulator security-header validation
- PWA production generation and route/static-asset smoke tests

## Production-console controls still required

These cannot be committed as source code and must be completed by the deployer:

- Register the production domain and reCAPTCHA Enterprise key
- Enable App Check enforcement for Functions and Authentication
- Configure Firebase Auth password policy and email-enumeration protection
- Set `IP_HASH_SALT` in Secret Manager
- Restrict IAM/service accounts to deployment and runtime duties
- Configure billing/budget, error-rate, failed-login, and App Check alerts
- Configure managed Firestore exports and retention
- Review administrator account list and MFA rollout

## Security assumptions

- Firebase/Google frontends provide the trusted request IP boundary.
- Anonymous Auth identifies a browser session, not a legal identity; mobile ownership OTP is not implemented.
- Operational users protect their Firebase/Google credentials.
- Official legal/eligibility decisions remain an organizational responsibility.

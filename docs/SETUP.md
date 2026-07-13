# Installation and Environment Guide

## Requirements

- Node.js 20
- npm 10+
- JDK 21+ for Firestore Emulator
- Firebase CLI
- Firebase project on Blaze plan
- Google Cloud/Firebase permissions for deployment

## Install

```bash
npm ci
npm --prefix functions ci
```

## Frontend variables

Copy `.env.example` to `.env.local` for development and `.env.production` for production.

| Variable | Required | Purpose |
|---|---:|---|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web App key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Project bucket identifier |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase Web App config |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase Web App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Yes | Analytics measurement ID |
| `VITE_FIREBASE_APPCHECK_SITE_KEY` | Production | reCAPTCHA Enterprise site key |
| `VITE_FIREBASE_FUNCTIONS_REGION` | Yes | Defaults to `asia-south1` |
| `VITE_USE_FIREBASE_EMULATORS` | Development | `true` for local emulators |
| `VITE_FIREBASE_EMULATOR_HOST` | Development | Defaults to `127.0.0.1` |
| `VITE_PUBLIC_SITE_URL` | Yes | Canonical HTTPS origin and share URL |
| `VITE_APP_VERSION` | Yes | Monitoring/build identifier |

Firebase Web App values are public identifiers, not service-account secrets. Never place Admin SDK JSON, private keys, or `IP_HASH_SALT` in Vite variables.

## Function variables and secret

Copy `functions/.env.example` to `functions/.env.<project-id>`:

```text
PUBLIC_SITE_URL=https://rewards.example.com
ENFORCE_APP_CHECK=true
```

Set the secret through Secret Manager:

```bash
npx firebase functions:secrets:set IP_HASH_SALT
```

For emulators only, copy `functions/.secret.local.example` to `functions/.secret.local`.

## Firebase console configuration

1. Enable Anonymous Authentication.
2. Enable Email/Password Authentication.
3. Configure a strong password policy and email enumeration protection.
4. Create Firestore in production mode.
5. Register the web app with App Check using reCAPTCHA Enterprise.
6. Enable App Check enforcement for Functions and Authentication after verifying metrics.
7. Enable Analytics and Performance Monitoring.
8. Configure budget alerts and Cloud Logging retention.

## First administrator

Create the user through Firebase Console Authentication, authenticate locally with Application Default Credentials, then run:

```bash
npm --prefix functions run admin:claim -- admin@example.com
```

The administrator must sign out and back in after a claim change.

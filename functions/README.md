# CITIWALK Cloud Functions

Trusted backend for participant registration and the administrator console. All functions deploy to `asia-south1` and enforce Firebase App Check by default outside emulators.

## Participant functions

- `getPublicSettings`
- `getParticipationState`
- `getParticipantLocationOptions`
- `verifyInstagramFollow`
- `verifyWhatsAppShare`
- `prepareEntryNumbers`
- `confirmParticipantRegistration`
- `reportClientError`

## Admin functions

- `getAdminOverview`
- `adminListParticipants`
- `adminGetParticipantDetails`
- `adminGetParticipantFilterOptions`
- `adminExportParticipants`
- `adminDeleteParticipant`
- `getAdminAnalytics`
- `getAdminWinnerDraw`
- `drawAdminWinners`
- `recordAdminWinnerExport`
- `getAdminSettings`
- `updateAdminSettings`
- `adminListSystemLogs`
- `recordAdminLoginAttempt`

Admin APIs require `request.auth.token.admin === true`.

## Security

- App Check/reCAPTCHA Enterprise
- Anonymous participant Auth and custom-claim admin Auth
- IP/device fixed-window rate limits with cooldowns
- Server payload size/type/format validation
- Salted IP hashes; raw IP never stored
- Server verification sequence and counters
- Atomic participant/entry transaction
- Permanent cryptographic winner draw
- Audit, security, failed registration, verification, and client error logs
- No browser Firestore access to sensitive collections

## Setup

```bash
npm ci
cp .env.example .env.YOUR_PROJECT_ID
firebase functions:secrets:set IP_HASH_SALT
npm run build
```

Local emulators require `functions/.secret.local` from the provided example. Production uses Secret Manager.

## Operational scripts

```bash
npm run seed:settings
npm run admin:claim -- admin@example.com
```

Both scripts use Application Default Credentials and must be run by an authorized operator.

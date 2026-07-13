# Callable Functions API

All functions deploy to `asia-south1`. Except `getPublicSettings`, calls require Firebase Authentication. Production calls require App Check. Admin calls additionally require `request.auth.token.admin === true`.

## Participant API

### `getPublicSettings`
Returns whitelisted campaign dates, URLs, share message, registration state, and maintenance state.

### `getParticipationState`
Returns server verification attempts, successful WhatsApp shares, completion booleans, and any confirmed Entry ID.

### `getParticipantLocationOptions`
Input: `{ scope, countryCode?, stateCode? }`. Returns country, state, or city/district options. Requires an Auth session.

### `verifyInstagramFollow`
Input: `{ deviceFingerprint }`. Enforces a five-second server delay. Attempt 1 fails; attempt 2 succeeds. Further calls return completed state.

### `verifyWhatsAppShare`
Input: `{ deviceFingerprint }`. Enforces a five-second delay and the fixed sequence:

```text
FAIL, SUCCESS, SUCCESS, FAIL, SUCCESS,
SUCCESS, SUCCESS, SUCCESS, SUCCESS, SUCCESS
```

Attempt 10 is the eighth success.

### `prepareEntryNumbers`
Input: `{ mobileNumber, countryCode, deviceFingerprint }`. Revalidates participation and duplicate mobile state, then returns one available four-, five-, and six-digit candidate with a ten-minute expiry.

### `confirmParticipantRegistration`
Input includes validated profile fields, canonical six-digit number, and browser fingerprint. A transaction checks tasks, candidate expiry, duplicate mobile, and number availability before creating participant and number assignment.

### `reportClientError`
Sanitized, throttled browser error reporting to server logs.

## Admin API

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

## Error codes

| Code | Meaning |
|---|---|
| `unauthenticated` | Auth session missing |
| `permission-denied` | Admin claim missing |
| `invalid-argument` | Validation/payload failure |
| `failed-precondition` | Tasks incomplete, registration closed, or candidates expired |
| `already-exists` | Duplicate mobile or permanent draw exists |
| `aborted` | Selected entry number became unavailable |
| `resource-exhausted` | Rate/cooldown limit or number generation exhaustion |
| `not-found` | Admin target missing |

Client UI converts these into inline validation, modal results, toasts, fresh number generation, or friendly retry states.

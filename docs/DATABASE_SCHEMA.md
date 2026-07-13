# Firestore Schema

## `participants/{e164Mobile}`

The deterministic document ID is the normalized E.164 mobile number. Sensitive collection; Functions only.

| Field | Type | Notes |
|---|---|---|
| `fullName` | string | Validated plain text |
| `mobileNumber` | string | E.164; equals document ID |
| `instagramId` | string | Normalized with `@` |
| `countryCode` | string | ISO alpha-2 |
| `country`, `state`, `district` | string | Server-selected labels |
| `entryId` | string | `#GIVE-2026-XXXXXX` |
| `selectedEntryNumber` | string | Canonical six digits |
| `instagramVerified`, `whatsappVerified` | boolean | Derived from server logs |
| `whatsappSuccessfulShares` | number | 8 at completion |
| `createdDate` | string | IST `YYYY-MM-DD` |
| `timestamp` | Timestamp | Server timestamp |
| `ipHash` | string | Salted SHA-256 |
| `browserFingerprint` | string | SHA-256 |
| `userAgent` | string | Server request header, capped |
| `deviceType` | string | mobile/tablet/desktop |
| `status` | string | `confirmed` |
| `ownerUid` | string | Anonymous Auth UID |

## `entryNumbers/{sixDigits}`

States: `available`, `reserved`, `assigned`. Registration accepts absent or `available`; `reserved`/`assigned` can never be assigned. Deleting a participant does not release its number.

## `settings/public`

Campaign names, dates, countdown target, Instagram URL, WhatsApp message, legal URLs, support details, registration flag, maintenance flag, update metadata. Public Functions return a whitelist.

## `logs/{id}`

- `verification_session`: per-UID aggregate state and candidate expiry
- `verification_attempt`: immutable attempt result
- `entry_numbers_generated`
- `registration_completed`
- `admin_audit`
- `security_event`
- `client_error`

## `winnerDraws/official-2026`

Permanent draw document containing exactly ten ordered winner records, source participant count, administrator identity, and draw timestamp.

## `rateLimits/{hash}`

Server-only fixed-window state keyed by salted scope/identifier hashes. `expiresAt` has TTL enabled through `firestore.indexes.json`.

## Indexes

- Logs: `uid ASC, timestamp DESC`
- Logs: `recordType ASC, timestamp DESC`
- TTL: `rateLimits.expiresAt`

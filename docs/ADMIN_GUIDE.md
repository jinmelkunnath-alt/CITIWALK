# Administrator Guide

## Access

Navigate to `/admin/login`. Login requires Email/Password Auth plus `admin: true` custom claim. Participant or ordinary Firebase accounts are redirected and rejected by server APIs.

## Dashboard

Metrics auto-refresh every 30 seconds. Available number capacity is calculated from the four-to-six-digit number space minus assigned and reserved documents. Recent activity uses fresh server data.

## Participants

- Search Entry ID, name, phone, or Instagram ID
- Filter country, state, district, verification, and date
- Sort newest/oldest
- Navigate cursor-based server pages
- Open a details drawer for device/security and verification history
- Export the current filters as UTF-8 CSV or modern `.xlsx`
- Delete only after providing an audit reason

Deletion never releases an entry number. Export actions and deletions are audited.

## Analytics

Charts cover daily registrations, trend, geography, hourly activity, devices, browsers, verification rates, and attempts. Analytics reads are server-only and capped for predictable execution.

## Winner selection

The Draw Winners action requires confirmation. The server requires at least ten eligible participants, securely shuffles them, selects exactly ten unique people, and transactionally creates the permanent draw. There is no redraw API.

Export results as CSV/XLSX. Exports are audited.

## Settings

Edit campaign identity, announcement/countdown, Instagram URL, WhatsApp message, legal URLs, support details, registration availability, and maintenance mode. `{URL}` in the WhatsApp message is replaced with the public site URL.

## Logs

Review admin logins, failed attempts, deletions, draw, settings changes, exports, rate-limit violations, registration failures, and client errors. Logs contain hashes rather than raw IP addresses.

## Administrator lifecycle

Grant:

```bash
npm --prefix functions run admin:claim -- admin@example.com
```

To revoke, use Admin SDK/Cloud Console to remove the custom claim, revoke refresh tokens, and disable the account if necessary. All claim changes require a fresh sign-in token.

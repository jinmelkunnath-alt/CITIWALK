# Participant Flow

1. App initializes Firebase, App Check, monitoring, Analytics, and a persistent anonymous Auth session.
2. Public settings load through a whitelisted Callable Function.
3. Instagram opens at the configured account. Server attempt 1 fails after five seconds; attempt 2 succeeds.
4. WhatsApp opens with the configured message and public URL. Each return verification waits five seconds and applies the fixed attempt sequence. Eight successes complete the task on attempt 10.
5. Overall progress is derived from server values. The form unlocks only when both tasks are complete.
6. Country loads first; state depends on country; district/city depends on state.
7. Full name, E.164 mobile, Instagram ID, and location are validated in browser and again on server.
8. `prepareEntryNumbers` checks the mobile duplicate and task state without saving a participant.
9. The server returns one available four-, five-, and six-digit candidate. Candidates expire after ten minutes and are not reserved yet.
10. Participant selects one number and presses Confirm Entry.
11. Firestore transaction rechecks all invariants. Reservation conflict or expiry returns three fresh options.
12. Successful transaction creates participant and assignment, generating `#GIVE-2026-XXXXXX`.
13. Celebration supports screenshot save, Entry ID copy, and return home.

## Recovery behavior

- Network failure: toast/retry; no partial write
- Duplicate mobile: registration stops with exact explanation
- Verification failure: progress does not increase
- Candidate conflict: fresh candidates automatically replace stale values
- Candidate expiry: fresh candidates automatically generated
- Function rate limit: retry-after message
- Offline: no registration/verification operation is cached or queued
- Existing registration session: confirmed Entry ID is restored after reload

# Firebase client boundary

This directory owns Firebase Web SDK initialization for the participant journey.

`client.ts`:

- validates Vite Firebase configuration
- initializes the Firebase app once
- creates a persistent anonymous Auth session
- connects Callable Functions in `asia-south1`
- optionally connects Auth and Functions emulators

No UI component imports Firebase SDK modules directly. Components consume `ParticipantProvider`; the provider delegates all remote operations to `src/services/participantService.ts`.

Sensitive Firestore collections are not accessed from the browser. Participant, entry-number, and verification writes are performed only by Callable Cloud Functions using Admin SDK.

Firebase Storage is intentionally not initialized because participant registration has no file uploads. `storage.rules` denies all access until a future approved use case exists.

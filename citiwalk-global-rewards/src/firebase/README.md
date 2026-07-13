# Firebase boundary (future phase)

This directory is intentionally documentation-only in the foundation release.

When Firebase is approved for implementation, keep SDK initialization, emulator configuration, typed converters, and provider adapters inside this boundary. UI components and sections must never import Firebase SDK modules directly; they should depend on typed service contracts from `src/services`.

Not included in this phase:

- Firebase configuration or credentials
- Authentication
- Firestore or Realtime Database
- Cloud Functions
- Storage
- Verification or entry persistence

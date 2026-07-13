# Participant service layer

The React UI depends on typed service adapters rather than Firebase SDK calls.

- `participantService.ts` — typed Callable Functions contracts
- `analyticsService.ts` — resilient Firebase Analytics event adapter
- `fingerprintService.ts` — SHA-256 browser fingerprint generation
- `locationService.ts` — dependent country/state/district options through the backend

All participant writes, duplicate checks, verification attempts, entry-number availability, and registration transactions remain server-authoritative in `functions/src`.

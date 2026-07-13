# Service layer boundary

Application integrations belong here as typed adapters. The current foundation deliberately contains no giveaway, task, entry, verification, authentication, countdown, or persistence services.

Future services should:

1. Expose framework-agnostic TypeScript contracts.
2. Hide vendor SDKs behind adapters.
3. Return domain-safe data rather than provider payloads.
4. Keep side effects out of presentational components.
5. Be testable without rendering React.

# Maintenance Guide

## Routine schedule

Weekly:

- Review Cloud Function errors, security events, failed logins, and rate limits
- Review App Check invalid request ratio
- Verify backup completion
- Review Firebase/Google Cloud budgets

Monthly:

- Update dependencies in a branch; run audit, tests, emulator flows, and browser QA
- Review admin user list and remove stale claims
- Review CSP sources and external integrations
- Check Firestore index usage and Function latency
- Test PWA update/offline behavior

Quarterly:

- Restore a backup into an isolated project
- Rotate IP hash salt only with a documented migration/retention decision
- Review legal content and retention
- Run accessibility and cross-browser audits
- Revalidate winner-draw controls before campaign close

## Safe maintenance mode

Enable Maintenance Mode in Admin Settings. This replaces the public campaign surface with a retryable maintenance screen while keeping admin access available. For a full write freeze, also close registration and deploy a temporary server-side setting check if required by the incident.

## Dependency policy

- Never apply forced audit upgrades directly to production.
- Evaluate upstream Firebase Admin/CLI advisories and compatibility.
- Keep runtime dependencies separate from development tooling findings.
- Rebuild both root and `functions` lockfiles after approved updates.

## Function scaling

Global options use region `asia-south1`, controlled concurrency, 60-second defaults, and max instances. Heavy analytics/export/draw callables have explicit 120-second/512 MiB settings. Monitor latency and Firestore reads before increasing limits.

## Data retention

Configure written policies for participants, security logs, client errors, audit logs, and backups. Rate-limit documents use TTL. Winner and deletion audit records require campaign/legal retention approval.

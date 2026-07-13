# Backup and Recovery

## Firestore backups

Use scheduled managed Firestore exports to a dedicated, versioned Cloud Storage bucket in the same compliance boundary. Recommended:

- Daily export, 30-day retention
- Weekly export, 12-week retention
- Monthly export, 12-month retention
- Object versioning and retention policy
- Separate restore-test project
- Alerts for failed schedules

Example operation (authorized CI/Cloud Scheduler identity):

```bash
gcloud firestore export gs://YOUR_BACKUP_BUCKET/citiwalk/$(date +%F) \
  --project=YOUR_FIREBASE_PROJECT_ID
```

Test restoration quarterly:

```bash
gcloud firestore import gs://YOUR_BACKUP_BUCKET/citiwalk/YYYY-MM-DD \
  --project=YOUR_RESTORE_TEST_PROJECT
```

Never test an import over production.

## Configuration backups

Version control stores source, Functions, rules, indexes, Hosting config, and environment templates. Secret values remain in Secret Manager. Document secret rotation dates separately.

## Winner draw protection

`winnerDraws/official-2026` is permanent and should be included in every export after the draw. Export the winner CSV/XLSX and retain it under controlled access with the corresponding audit log.

## Recovery order

1. Declare incident and stop risky writes using Maintenance Mode/registration closure.
2. Preserve Cloud Logs and current Firestore export.
3. Identify last known-good application and database state.
4. Restore into an isolated project and validate counts/invariants.
5. Redeploy rules, indexes, Functions, then Hosting.
6. Restore required data only after approval.
7. Rotate compromised secrets/tokens and revoke affected admin sessions.
8. Reopen traffic gradually and monitor errors/rate limits.
9. Record timeline, impact, remediation, and follow-up controls.

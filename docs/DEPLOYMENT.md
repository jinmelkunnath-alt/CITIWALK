# Production Deployment

## Preflight

```bash
npm ci
npm --prefix functions ci
npm run typecheck
npm run lint
npm run test:unit
npm run build:production
```

`build:production` requires `.env.production`, HTTPS domain, App Check key, Analytics ID, and complete Firebase Web config.

## Firebase prerequisites

- `.firebaserc` points to the production project
- Blaze billing enabled
- Auth providers/password policy configured
- App Check registered and enforced
- `IP_HASH_SALT` in Secret Manager
- `functions/.env.<project-id>` contains production domain and `ENFORCE_APP_CHECK=true`
- Firestore backups and budget alerts configured

## Deploy order

For a first deployment:

```bash
npx firebase deploy --only firestore:rules,firestore:indexes,storage
npx firebase deploy --only functions
npm --prefix functions run seed:settings
npx firebase deploy --only hosting
```

Routine deployment:

```bash
npm run firebase:deploy
```

## Post-deploy validation

1. Verify CSP/HSTS headers with browser DevTools and an external header scanner.
2. Confirm `robots.txt`, `sitemap.xml`, manifest, icons, and service worker.
3. Verify App Check metrics and enforcement.
4. Register a test participant through the complete flow.
5. Confirm duplicate mobile and number conflict behavior.
6. Confirm non-admin `/dashboard` redirect and callable rejection.
7. Validate admin list, export, settings, logs, and analytics.
8. Do not run the permanent winner draw as a deployment test in production.
9. Run Lighthouse in a clean production profile and test target devices.
10. Verify Analytics DebugView, Performance traces, Cloud Logging, alerts, and budgets.

## Hosting cache behavior

- Hashed JS/CSS/font assets: one year immutable
- Images: 30 days with revalidation
- HTML, service worker, admin routes: no-store/no-cache
- Service worker precaches the application shell but excludes analytics and Excel export heavy chunks
- Callable POST responses are not cached

Firebase Hosting automatically serves Brotli/gzip where supported.

## Rollback

Hosting:

```bash
npx firebase hosting:channel:deploy rollback-candidate --expires 1d
# Validate, then use Firebase Console release history to roll back production.
```

Functions: check out the previous release tag, run quality checks, and redeploy Functions. Rules/indexes: restore the previous version-controlled files and deploy them explicitly. Never roll back a schema without checking documents written by the newer release.

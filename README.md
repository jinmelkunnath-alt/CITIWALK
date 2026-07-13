# CITIWALK Global Rewards

Enterprise React + Firebase giveaway platform for CITIWALK. The repository contains the premium public participant journey, secure registration backend, protected administrator console, permanent server-side winner draw, analytics, exports, PWA, monitoring, security rules, and production deployment configuration.

Only Firebase credentials, the Firebase project ID, and the final HTTPS domain must be supplied before deployment.

## Production stack

- React 18, TypeScript, Vite
- Tailwind CSS, Framer Motion, GSAP
- Firebase Hosting and PWA service worker
- Firebase Authentication: anonymous participant sessions and Email/Password administrators
- Firebase App Check with reCAPTCHA Enterprise
- Callable Cloud Functions in `asia-south1`
- Cloud Firestore and deny-by-default Storage
- Firebase Analytics and Performance Monitoring
- Context API
- Recharts analytics and on-demand OOXML Excel export

## Application surfaces

### Public

- Premium landing page and exact IST countdown
- Instagram and WhatsApp verification simulation
- Dependent country/state/district selection
- Mobile validation and duplicate prevention
- Three server-generated available entry numbers
- Atomic Firestore reservation and registration
- Confirmation, Entry ID copy, and screenshot download
- Terms, Privacy, Official Rules, Offline, Maintenance, 404, and 500 experiences

### Administrator

- Email/password login plus required `admin: true` custom claim
- Protected `/dashboard` routes
- Live dashboard metrics and activity
- Server-paginated participant table, filters, details drawer, CSV/XLSX exports, deletion audit
- Interactive analytics
- Permanent secure draw of exactly ten unique winners
- Campaign settings
- System, security, and audit logs

## Quick start

```bash
npm install
npm --prefix functions install
cp .env.example .env.local
cp functions/.env.example functions/.env.YOUR_PROJECT_ID
cp functions/.secret.local.example functions/.secret.local
npm run dev
```

For emulator development, set `VITE_USE_FIREBASE_EMULATORS=true` in `.env.local`, then run:

```bash
npm run firebase:emulators
```

The current Firebase CLI requires JDK 21+ for the Firestore emulator.

## Quality commands

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build:all
```

Production builds additionally reject missing credentials, placeholder domains, and non-HTTPS domains:

```bash
cp .env.example .env.production
npm run build:production
```

## Firebase setup summary

1. Replace `YOUR_FIREBASE_PROJECT_ID` in `.firebaserc`.
2. Create a Firebase Web App and populate `.env.production`.
3. Enable Anonymous and Email/Password Authentication.
4. Configure a strong Firebase Authentication password policy.
5. Create Firestore in production mode.
6. Create a reCAPTCHA Enterprise site key and populate `VITE_FIREBASE_APPCHECK_SITE_KEY`.
7. Register the Web App with Firebase App Check; enforce App Check for Functions and Authentication in production.
8. Set the server secret:

   ```bash
   npx firebase functions:secrets:set IP_HASH_SALT
   ```

9. Seed settings:

   ```bash
   npm --prefix functions run seed:settings
   ```

10. Create the first Auth user and grant the custom claim using Application Default Credentials:

    ```bash
    npm --prefix functions run admin:claim -- admin@example.com
    ```

11. Deploy:

    ```bash
    npm run firebase:deploy
    ```

## Security summary

- Firestore browser reads/writes for participants, numbers, logs, winners, settings, and throttling state are denied.
- Cloud Functions whitelist public settings and enforce auth/App Check.
- Admin APIs require a server-issued custom claim.
- Registration and winner selection are server-authoritative.
- IP/device rate limits, cooldowns, payload limits, type validation, markup rejection, and audit logging are enabled.
- Raw IP addresses are never stored.
- CSV exports neutralize spreadsheet formulas.
- Firebase Hosting sends CSP, HSTS, frame, MIME, referrer, permissions, and COOP headers.
- Service Worker caching is static-only; participant, verification, countdown state, and admin data are never API-cached.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Installation and environments](docs/SETUP.md)
- [Firebase and security](docs/FIREBASE_SECURITY.md)
- [Production security audit](docs/SECURITY_AUDIT.md)
- [Cloud Functions API](docs/API.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
- [Participant flow](docs/PARTICIPANT_FLOW.md)
- [Admin manual](docs/ADMIN_GUIDE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Maintenance](docs/MAINTENANCE.md)
- [Backup and recovery](docs/BACKUP_RECOVERY.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [QA checklist](docs/QA_CHECKLIST.md)

## Final routes

```text
/                         Public campaign
/terms                    Terms
/privacy                  Privacy Policy
/official-rules           Official Rules
/offline                  Offline recovery
/admin/login              Administrator login
/dashboard                Admin overview
/dashboard/participants   Participant management
/dashboard/analytics      Analytics
/dashboard/winners        Permanent winner draw
/dashboard/settings       Campaign settings
/dashboard/logs           Audit and security logs
```

## Out of scope

- Participant import
- Rerunning or deleting the permanent winner draw
- Public Firestore access
- File uploads
- Client-side winner selection

MFA enrollment/challenge UI is prepared as a future authentication extension; Firebase custom claims and admin function checks remain mandatory regardless of MFA state.

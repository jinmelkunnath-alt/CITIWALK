# Final QA Checklist

## Automated

- [ ] `npm ci`
- [ ] `npm --prefix functions ci`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:unit`
- [ ] `npm run build:all`
- [ ] Participant emulator integration test
- [ ] Admin emulator integration test
- [ ] Admin deletion smoke test
- [ ] Admin logs smoke test

## Participant

- [ ] Countdown equals 10 August 2026 4:00 PM IST / 10:30 UTC
- [ ] Instagram attempt 1 fails, attempt 2 succeeds
- [ ] WhatsApp sequence completes 8 successes on attempt 10
- [ ] Progress and form lock update from server state
- [ ] Country → state → district dependencies
- [ ] E.164 validation and country mismatch
- [ ] Duplicate mobile rejection
- [ ] Three unique available numbers (4/5/6 digits)
- [ ] Reservation conflict regenerates candidates
- [ ] Entry ID six-digit padding
- [ ] Screenshot, copy, confetti, return home
- [ ] Rate-limit retry feedback

## Admin

- [ ] Participant/non-admin cannot access routes or APIs
- [ ] Login success, failure, cooldown, logout
- [ ] Dashboard counters and auto-refresh
- [ ] Participant search/filter/sort/cursor pagination
- [ ] Details drawer and history
- [ ] CSV formula safety and XLSX export
- [ ] Delete reason and audit
- [ ] Analytics empty and populated states
- [ ] Settings update and maintenance mode
- [ ] Logs/search/pagination/security events
- [ ] Ten unique winners and permanent redraw rejection

## Responsive viewports

- [ ] 320 × 568
- [ ] 375 × 667
- [ ] 390 × 844
- [ ] 414 × 896
- [ ] 768 × 1024
- [ ] 1024 × 768
- [ ] 1280 × 800
- [ ] 1440 × 900
- [ ] 1920 × 1080
- [ ] portrait and landscape

## Browser/accessibility

- [ ] Chrome, Edge, Firefox, Safari, Brave, Samsung Internet
- [ ] Keyboard-only public and admin flow
- [ ] Visible focus, skip links, modal/drawer focus return
- [ ] Screen-reader labels and live regions
- [ ] 200% zoom and reflow
- [ ] WCAG AA contrast review
- [ ] Reduced-motion mode

## Production

- [ ] HTTPS domain/canonical/social preview
- [ ] CSP/HSTS/security headers
- [ ] App Check enforcement and metrics
- [ ] `robots.txt` and `sitemap.xml`
- [ ] PWA install/update/offline
- [ ] No API response caching
- [ ] Analytics DebugView and Performance
- [ ] Cloud Logging alerts and budget alerts
- [ ] Backup schedule and restore test
- [ ] Lighthouse run against deployed production build

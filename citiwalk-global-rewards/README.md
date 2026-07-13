# CITIWALK Global Rewards

Premium public frontend for the CITIWALK Global Rewards campaign. The codebase extends the original Phase 1 architecture with the complete animated landing-page interface while keeping all backend, verification, database, and administration concerns disconnected.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- GSAP for ambient background motion
- React Router with lazy route modules
- React Helmet Async
- React Icons
- Context API for UI notifications

## Run locally

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Public landing-page flow

1. Interactive 16:9 hero image placeholder with pointer parallax
2. Live countdown to 10 August 2026, 4:00 PM IST
3. Ten-card prize showcase
4. Instagram and WhatsApp participation UI
5. Overall participation progress dashboard
6. Entry form with frontend-only validation and searchable dropdowns
7. Three-option entry number selector
8. Manually previewable success-modal design
9. Animated FAQ accordion
10. Premium glass footer

## Architecture

```text
src/
├── animations/       Motion presets, reveals, parallax and page transitions
├── assets/           Brand-owned static assets
├── components/
│   ├── brand/        Brand identity components
│   ├── content/      Shared editorial patterns
│   ├── interactions/ Pointer tilt interaction primitives
│   ├── layout/       Navbar, footer, containers and ambient layers
│   ├── providers/    Application provider composition
│   ├── seo/          Helmet-based metadata
│   ├── ui/           Typed design-system primitives
│   └── visuals/      Campaign visual placeholders
├── constants/        Brand, campaign, prize and navigation constants
├── context/          Context providers and context definitions
├── firebase/         Documented future Firebase boundary (no SDK code)
├── hooks/            Countdown, browser, UI and GSAP hooks
├── pages/            Lazy-loaded route modules
├── routes/           Route composition and canonical paths
├── sections/home/    Independent public landing-page sections
├── services/         Documented future integration boundary
├── styles/           Semantic tokens and Tailwind component utilities
└── utils/            Framework-agnostic helpers
```

## Design system

Semantic RGB tokens live in `src/styles/tokens.css`; product-level Tailwind extensions live in `tailwind.config.ts`.

The component library includes buttons with pointer ripples, glass cards, countdown cards, text inputs, native dropdowns, accessible searchable comboboxes, modals, toasts, progress bars, status badges, loaders, accordions, section titles, and typed style variants.

The animation layer includes fade, scale, stagger, hero entrance, floating, glow pulse, slow rotation, particle movement, scroll reveal, pointer tilt, mouse parallax, animated reflections, and reduced-motion fallbacks.

## Countdown behavior

`useCountdown` targets the fixed ISO instant:

```text
2026-08-10T16:00:00+05:30
```

The explicit `+05:30` offset ensures every browser counts down to 4:00 PM IST accurately, regardless of the viewer's local timezone. This is a frontend display timer only; no backend clock or campaign closure service is implemented.

## Frontend-only interactions

- Searchable country, state, and district comboboxes
- Local UI validation for entry fields
- One-of-three visual entry number selection
- Manual success-modal design preview
- Informational preview toasts for disconnected participation actions
- Live client-side countdown
- Keyboard-accessible accordion, modal, controls, and navigation

No local interaction is treated as a verified or persisted giveaway action.

## Routing

- `/`
- `/terms`
- `/privacy`
- `/official-rules`
- `/admin/login` — unchanged empty placeholder
- `/dashboard` — unchanged empty placeholder
- Catch-all 404

## Intentionally excluded

- Firebase initialization or Cloud Functions
- Database reads or writes
- Form submission or participant persistence
- Instagram verification
- WhatsApp sharing or verification logic
- Entry ID generation
- Lucky-number generation or reservation
- Winner-selection logic
- OTP
- Authentication
- Admin functionality
- Backend countdown enforcement

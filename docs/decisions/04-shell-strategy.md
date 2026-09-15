# ADR 004: Shell Strategy - Bundled Static Export

## Status
Accepted

## Context
The mobile app shell strategy determines how the Next.js web app is packaged into Capacitor. Options considered:

1. **Live Server (server.url)** - Capacitor loads from `http://localhost:3000` or remote URL
2. **Bundled Static Export** - `next build` → `output: 'export'` → static files copied to native bundle
3. **Hybrid (Capacitor Live Reload)** - Dev: live server, Prod: bundled

## Decision
Use **Bundled Static Export** for production; **Live Server** for development fallback.

## Configuration
```typescript
// next.config.ts
output: 'export',
images: { unoptimized: true },
trailingSlash: true

// capacitor.config.ts
webDir: 'out',
server: { url: 'http://192.168.40.26:3000', cleartext: true }  // Dev only
```

## Rationale
- **Production-like** - Same static files as web deployment, no server runtime
- **Offline-first** - All assets bundled, works without network
- **Fast startup** - No network request to load initial HTML
- **App Store compliant** - No dynamic code loading, passes review
- **Simpler CI/CD** - Single build artifact for web and mobile
- **Capacitor best practice** - Recommended for production apps

## Development Workflow
```bash
# Development (with live reload)
pnpm dev          # Starts Next.js on :3000
npx cap run ios   # Loads from server.url (live reload works)

# Production build
pnpm build        # Generates out/ with static files
npx cap sync      # Copies out/ → ios/App/App/public
npx cap run ios   # Loads from local bundle
```

## Static Export Requirements
- All dynamic routes need `generateStaticParams()`
- No Server Actions (replaced with client-actions.ts + dataStore)
- No `getServerSideProps` / `getStaticProps` (App Router uses Server Components)
- Images: `unoptimized: true` (no Image Optimization API)

## Consequences
- **No SSR** - All pages pre-rendered at build time
- **Build-time data** - Seed data baked into static HTML
- **No dynamic API routes** - Mutations use client-side outbox
- **Larger bundle** - All routes included, but code-split by Next.js
- **Dev/Prod parity risk** - Must test both modes

## Implementation
- `next.config.ts` - Static export config
- `generateStaticParams()` on all `[id]` routes
- `src/lib/client-actions.ts` - Replaces Server Actions
- `src/lib/storage/data-store.ts` - In-memory store (seeded at build)
- `src/features/offline/lib/sync-engine.ts` - Outbox replay
- `capacitor.config.ts` - `webDir: 'out'`, no `server.url` in prod

## Related
- ADR 001: Local Notifications (work with static export)
- ADR 003: Offline Storage (outbox replaces server mutations)
- Build scripts in `package.json`: `build:mobile`, `cap:ios`
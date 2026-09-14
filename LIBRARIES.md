# Libraries & Decisions

## Core Libraries

| Library | Version | Purpose | Decision |
|---------|---------|---------|----------|
| Next.js | 16.3.5 | React framework with App Router | Required by FRD |
| React | 19 | UI library | Required by Next.js 16 |
| TanStack Query | v5 | Server state management | Required by FRD (named hooks only) |
| Tailwind CSS | v4 | Styling | Required by FRD (mobile-first) |
| Zod | 3.x | Runtime validation | Required by FRD |
| idb | 8.x | IndexedDB wrapper | Offline outbox persistence |
| TypeScript | 5.x | Type safety | Required (strict mode) |

## Architecture Decisions

### 1. Data Layer
- **Server Actions** for all mutations (envelope: `{success, message?, data?}`)
- **TanStack Query** for all queries via named custom hooks only
- **No direct `useQuery`/`useMutation` in components**
- **Optimistic updates** for offline-capable mutations

### 2. Offline Strategy (Web)
- `navigator.onLine` + `online`/`offline` events
- IndexedDB (via `idb`) for outbox persistence
- FIFO replay on reconnect, per-item states, retry
- Last-write-wins via server receipt order

### 3. Call Flow (Web Fallback)
- `tel:` link for call initiation
- Simulated `ended` event on window focus return
- CallOutcomeSheet appears after simulated end

### 4. Responsive Strategy
- Mobile-first Tailwind utilities
- Fork JSX at `md:` breakpoint (768px)
- Shared hooks/cache for both representations

### 5. Test Identifiers
All FRD test IDs implemented:
- Slice 1: 15 identifiers (contacts)
- Slice 2: 20 identifiers (jobs)
- Slice 3: 17 identifiers (work orders)
- Slice 4: 7 identifiers (offline)
- Slice 5: 4 identifiers (push)

## Known Lint Warnings (Accepted)
- `react-hooks/set-state-in-effect`: False positive for client-only rendering pattern
- `next/next/no-location-assign-relative-destination`: Intentional for not-found navigation
- Unused vars: Accepted for future use / API compatibility
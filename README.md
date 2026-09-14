# Field Companion - Web UI

RoofPilot Field Companion web application (mobile-first, Tailwind CSS). Implementation of the FRD for a roofing field management app.

## Tech Stack
- **Next.js 16** (App Router) + React 19
- **TanStack Query v5** (named hooks only)
- **Tailwind CSS v4** (mobile-first, md: 768px)
- **Zod** validation at server boundaries
- **TypeScript strict** mode
- **pnpm** package manager

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 8+

### Install Dependencies
```bash
pnpm install
```

### Development
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000)

### Production Build & Run (for offline testing)
```bash
pnpm build && pnpm start
```
Open [http://localhost:3000](http://localhost:3000) - works offline

### Testing
```bash
# TypeScript type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Vitest (experimental - may have Node version issues)
pnpm vitest run
```

## Features (5 FRD Slices)

### Slice 1: Contacts/Contact Directory
- `/contacts` - Searchable list, alphabetical, sticky search
- `/contacts/:id` - Detail with phone/email/address, jobs, notes
- Call button (`tel:`) → simulated call end → Call Outcome sheet
- Call outcome notes (1-500 chars, validation)

### Slice 2: Jobs/Job List
- `/jobs` - Responsive: table (desktop) / cards (mobile)
- Status filter with empty states
- `/jobs/:id` - Details, contact card, work orders list
- Create Work Order sheet (title 3-80, assignee, date ≥today)

### Slice 3: Work Orders/Execute Work Order
- `/work-orders` - My WOs grouped: Today / Upcoming
- `/work-orders/:id` - Status badge, advance/block/resume actions
- State machine: scheduled → en_route → on_site → done (blocked from en_route/on_site)
- Photo evidence (file input on web)
- Block sheet with reason validation (5-200 chars)

### Slice 4: Platform/Offline Outbox
- Yellow banner when offline
- Floating outbox indicator (mail icon) with pending count
- Outbox panel: pending/syncing/synced/failed items with retry
- IndexedDB persistence, FIFO replay on reconnect

### Slice 5: Platform/Assignment Push
- In-app banner on foreground (blue, top)
- Deep link to `/work-orders/:id`
- Not-found screen for invalid deep links
- Notification permission hint (non-nagging)

## Testing Offline
1. Run `pnpm build && pnpm start`
2. Click "Simulate Offline" button (top-right in dev)
3. Create work order / advance status / block / call outcome
4. Outbox indicator shows pending count
5. Click "Go Online" → items sync automatically

## Testing Push
In browser console:
```js
localStorage.setItem('field-companion-push', JSON.stringify({
  id: 'wo-test', title: 'Test WO', status: 'scheduled'
}))
```
Then refresh or wait 5s for polling.

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── contacts/          # Contact list & detail
│   ├── jobs/              # Job list & detail
│   ├── work-orders/       # Work order list & detail
│   ├── providers.tsx      # TanStack Query + Feedback providers
│   └── layout-client.tsx  # Layout with bottom nav
├── features/
│   ├── contacts/          # Contact feature (hooks, components, schema, server)
│   ├── jobs/              # Job feature
│   ├── work-orders/       # Work order feature
│   ├── offline/           # Offline outbox (hooks, lib, components)
│   └── push/              # Push notifications
├── components/
│   ├── ui/                # Reusable UI primitives
│   └── layout/            # Header, Navigation, SafeArea
├── lib/
│   ├── query-client.ts    # TanStack Query setup
│   ├── validation.ts      # Zod helpers
│   ├── feedback.tsx       # Toast notifications
│   └── storage/           # Seed data + in-memory store
└── types/                 # Domain types
```

## Documentation
- [LIBRARIES.md](LIBRARIES.md) - Core libraries & architecture decisions
- [PROMPTS.md](PROMPTS.md) - Agent prompts & code review checklist
- [docs/deviations.md](docs/deviations.md) - FRD deviations

## Test Identifiers
All FRD test IDs implemented (see FRD for complete list):
- Slice 1: 15 IDs
- Slice 2: 20 IDs  
- Slice 3: 17 IDs
- Slice 4: 7 IDs
- Slice 5: 4 IDs

## Known Limitations
- No Service Worker (offline caching limited to IndexedDB)
- Push simulated via localStorage polling
- Native plugins (Camera, Call Monitor) not available on web
- Single user (Casey Rivera), no auth

## License
MIT
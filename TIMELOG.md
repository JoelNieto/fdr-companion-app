# Time Log

## Phase 1: Foundation (Types, Schemas, Query Client, Feedback, Seed Data, UI Primitives)
- Types & Zod schemas: ~15 min
- TanStack Query setup with persistence: ~10 min
- Server actions with envelope pattern: ~15 min
- Feedback system (toasts): ~10 min
- Seed data (15 contacts, 10 jobs, 12 WOs): ~10 min
- UI primitives (Button, Input, Select, Sheet, Badge, Table, Card): ~20 min
- Layout components (Header, Navigation, SafeArea): ~10 min
- **Total: ~1.5 hours**

## Phase 2: Slice 1 - Contacts/Contact Directory
- Contact list with sticky search: ~10 min
- Contact detail with jobs & notes: ~15 min
- Call flow (tel: + simulated end + outcome sheet): ~15 min
- Test IDs (15): ~5 min
- **Total: ~45 min**

## Phase 3: Slice 2 - Jobs/Job List
- Responsive job list (table/cards): ~15 min
- Job detail with contact card & WO list: ~15 min
- Create Work Order sheet with validation: ~15 min
- Test IDs (20): ~5 min
- **Total: ~50 min**

## Phase 4: Slice 3 - Work Orders/Execute Work Order
- My Work Orders (Today/Upcoming groups): ~15 min
- Work order detail with status actions: ~20 min
- State machine enforcement (server): ~10 min
- Photo grid + camera permission explainer: ~15 min
- Block sheet with reason validation: ~10 min
- Test IDs (17): ~5 min
- **Total: ~1.25 hours**

## Phase 5: Slice 4 - Platform/Offline Outbox
- Online detection (navigator.onLine): ~10 min
- IndexedDB outbox store (idb): ~15 min
- Sync engine with FIFO replay: ~20 min
- Offline mutations hook: ~10 min
- Offline indicator + Outbox indicator/panel: ~15 min
- Test IDs (7): ~5 min
- **Total: ~1.25 hours**

## Phase 6: Slice 5 - Platform/Assignment Push
- PushProvider with localStorage polling: ~15 min
- Assignment banner (in-app, foreground): ~10 min
- Not-found screen with deep link handling: ~10 min
- Notification permission hint: ~10 min
- Test IDs (4): ~5 min
- **Total: ~50 min**

## Phase 7: Polish, Validation, Tests
- Vitest setup (compatibility issues with Node 20): ~20 min
- Test files (outbox, status transitions, hooks, call fallback): ~15 min
- LIBRARIES.md, PROMPTS.md, docs/deviations.md: ~15 min
- README.md with setup instructions: ~10 min
- Build & lint fixes: ~20 min
- **Total: ~1.25 hours**

## Grand Total: ~6.5 hours

## Notes
- Vitest has compatibility issues with Node 20 (rolldown bundler)
- Lint has 2 known false positives (ClientOnly pattern)
- All FRD test IDs implemented
- Production build passes (`pnpm build && pnpm start`)
- Times reflect AI-assisted implementation (actual human time ~1-2 hours of interaction)
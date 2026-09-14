# Web UI Implementation Plan

## Overview
Implement the Field Companion web UI (mobile-first, Tailwind CSS) covering all 5 FRD slices. Focus on responsive layouts, data layer with TanStack Query, server actions with Zod validation, and test identifiers per FRD.

## Tech Stack
- Next.js 16 (App Router) + React 19
- TanStack Query v5 (queries + mutations in named hooks)
- Zod validation at server boundaries
- Tailwind CSS v4 (mobile-first, md: 768px breakpoint)
- TypeScript strict mode
- Vitest for unit tests

## Folder Structure
```
src/
├── app/
│   ├── (dashboard)/          # Route group for authenticated views
│   │   ├── contacts/
│   │   │   ├── page.tsx      # Contact list (Slice 1)
│   │   │   └── [id]/page.tsx # Contact detail (Slice 1)
│   │   ├── jobs/
│   │   │   ├── page.tsx      # Job list (Slice 2)
│   │   │   └── [id]/page.tsx # Job detail + WO creation (Slice 2)
│   │   └── work-orders/
│   │       └── [id]/page.tsx # WO detail (Slice 3)
│   ├── api/
│   │   ├── contacts/
│   │   ├── jobs/
│   │   ├── work-orders/
│   │   └── outbox/
│   └── layout.tsx
├── features/
│   ├── contacts/
│   │   ├── hooks/
│   │   │   ├── use-contacts.hook.ts
│   │   │   ├── use-contact-detail.hook.ts
│   │   │   ├── use-call-outcome.hook.ts
│   │   │   └── use-call.hook.ts (web fallback)
│   │   ├── components/
│   │   │   ├── ContactList.tsx
│   │   │   ├── ContactRow.tsx
│   │   │   ├── ContactDetail.tsx
│   │   │   ├── CallOutcomeSheet.tsx
│   │   │   └── SearchInput.tsx
│   │   ├── schema/
│   │   │   └── contact.schema.ts
│   │   └── server/
│   │       └── actions.ts
│   ├── jobs/
│   │   ├── hooks/
│   │   │   ├── use-jobs.hook.ts
│   │   │   ├── use-job-detail.hook.ts
│   │   │   └── use-create-work-order.hook.ts
│   │   ├── components/
│   │   │   ├── JobList.tsx
│   │   │   ├── JobTable.tsx (desktop)
│   │   │   ├── JobCardList.tsx (mobile)
│   │   │   ├── JobDetail.tsx
│   │   │   ├── ContactCard.tsx
│   │   │   ├── WorkOrderList.tsx
│   │   │   └── CreateWorkOrderSheet.tsx
│   │   ├── schema/
│   │   │   └── job.schema.ts
│   │   └── server/
│   │       └── actions.ts
│   ├── work-orders/
│   │   ├── hooks/
│   │   │   ├── use-my-work-orders.hook.ts
│   │   │   ├── use-work-order-detail.hook.ts
│   │   │   ├── use-advance-status.hook.ts
│   │   │   ├── use-block-work-order.hook.ts
│   │   │   └── use-photo-evidence.hook.ts
│   │   ├── components/
│   │   │   ├── MyWorkOrdersList.tsx
│   │   │   ├── WorkOrderDetail.tsx
│   │   │   ├── StatusAdvanceButton.tsx
│   │   │   ├── BlockSheet.tsx
│   │   │   ├── PhotoGrid.tsx
│   │   │   └── CameraPermissionExplainer.tsx
│   │   ├── schema/
│   │   │   └── work-order.schema.ts
│   │   └── server/
│   │       └── actions.ts
│   ├── offline/
│   │   ├── hooks/
│   │   │   ├── use-online-status.hook.ts
│   │   │   ├── use-outbox.hook.ts
│   │   │   └── use-offline-mutations.hook.ts
│   │   ├── components/
│   │   │   ├── OfflineIndicator.tsx
│   │   │   ├── OutboxIndicator.tsx
│   │   │   └── OutboxPanel.tsx
│   │   ├── lib/
│   │   │   ├── outbox-store.ts (IndexedDB persistence)
│   │   │   └── sync-engine.ts
│   │   └── server/
│   │       └── actions.ts
│   └── push/
│       ├── hooks/
│       │   └── use-assignment-banner.hook.ts
│       ├── components/
│       │   ├── AssignmentBanner.tsx
│       │   └── NotFoundScreen.tsx
│       └── server/
│           └── actions.ts
├── lib/
│   ├── query-client.ts       # TanStack Query provider setup
│   ├── validation.ts         # Shared Zod helpers
│   ├── feedback.ts           # Toast/notification system
│   ├── storage/
│   │   └── seed-data.ts      # Demo data satisfying all FRD fixtures
│   └── types/
│       └── index.ts          # Domain types
├── components/
│   ├── ui/                   # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Sheet.tsx
│   │   ├── Badge.tsx
│   │   ├── Table.tsx
│   │   └── Card.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── SafeArea.tsx
└── styles/
    └── globals.css
```

## Implementation Phases

### Phase 1: Foundation (Shared Infrastructure)
1. **Types & Schemas** - Define Contact, Job, WorkOrder types and Zod schemas
2. **Query Client** - TanStack Query provider with persistence for offline
3. **Feedback System** - Toast mechanism for success/error envelopes
4. **Seed Data** - Generate ≥15 contacts, ≥10 jobs, ≥12 WOs satisfying all FRD fixtures
5. **UI Primitives** - Button, Input, Select, Sheet, Badge, Table, Card
6. **Layout Components** - Header, Navigation, SafeArea for mobile

### Phase 2: Slice 1 - Contacts/Contact Directory
1. **Server Actions** - CRUD for contacts (read-only per FRD), call outcome mutation
2. **Hooks** - useContacts, useContactDetail, useCallOutcome, useCall (web: tel:)
3. **Components** - ContactList, ContactRow, ContactDetail, SearchInput, CallOutcomeSheet
4. **Pages** - /contacts (list), /contacts/[id] (detail)
5. **Test IDs** - All 15 identifiers from FRD Slice 1

### Phase 3: Slice 2 - Jobs/Job List
1. **Server Actions** - Job queries, work order creation with Zod validation
2. **Hooks** - useJobs, useJobDetail, useCreateWorkOrder
3. **Components** - JobList, JobTable (desktop), JobCardList (mobile), JobDetail, ContactCard, WorkOrderList, CreateWorkOrderSheet
4. **Pages** - /jobs (list), /jobs/[id] (detail)
5. **Test IDs** - All 20 identifiers from FRD Slice 2

### Phase 4: Slice 3 - Work Orders/Execute Work Order
1. **Server Actions** - WO queries, status transitions (state machine), block/resume, photo evidence
2. **Hooks** - useMyWorkOrders, useWorkOrderDetail, useAdvanceStatus, useBlockWorkOrder, usePhotoEvidence
3. **Components** - MyWorkOrdersList, WorkOrderDetail, StatusAdvanceButton, BlockSheet, PhotoGrid, CameraPermissionExplainer
4. **Pages** - /work-orders/[id] (detail)
5. **Test IDs** - All 17 identifiers from FRD Slice 3

### Phase 5: Slice 4 - Platform/Offline Outbox (Web)
1. **Online Detection** - Navigator.onLine + online/offline events
2. **Outbox Store** - IndexedDB for persistence (idb library)
3. **Sync Engine** - FIFO replay on reconnect, per-item states, retry
4. **Hooks** - useOnlineStatus, useOutbox, useOfflineMutations (wraps WO status + call outcome)
5. **Components** - OfflineIndicator, OutboxIndicator, OutboxPanel
6. **Integration** - Wrap Slice 1 & 3 mutations with offline support
7. **Test IDs** - All 7 identifiers from FRD Slice 4

### Phase 6: Slice 5 - Platform/Assignment Push (Web)
1. **In-App Banner** - Foreground notification banner with deep link
2. **Deep Link Handling** - URL parsing for /work-orders/[id], not-found screen
3. **Permission Hint** - Single non-nagging hint for notification permission
4. **Test IDs** - All 4 identifiers from FRD Slice 5

### Phase 7: Polish & Validation
1. **Responsive Testing** - Verify mobile (<768px) cards, desktop (≥768px) tables
2. **Accessibility** - aria-disabled, focus management, semantic HTML
3. **Test Suite** - Vitest for hooks, mutations, outbox logic, web call fallback
4. **Lint/Typecheck** - pnpm lint, tsc --noEmit
5. **Demo Fixtures** - Verify all FRD fixtures reachable

## Key Technical Decisions

### Data Layer
- **Server Actions** for all mutations (envelope: { success, message?, data? })
- **TanStack Query** for all queries, custom hooks only (no direct useQuery in components)
- **Optimistic Updates** for offline-capable mutations (WO status, call outcomes)
- **Persistence** - TanStack Query persistQueryClient for cache, IndexedDB for outbox

### Responsive Strategy
- Mobile-first Tailwind utilities
- Fork JSX at md: breakpoint (JobTable vs JobCardList)
- Shared hooks/cache for both representations
- Safe-area insets via `env(safe-area-inset-*)`

### Offline Strategy (Web)
- navigator.onLine + window events for connectivity
- IndexedDB (via `idb`) for outbox persistence
- Optimistic UI updates → enqueue → replay on reconnect
- Last-write-wins via server receipt order

### Call Flow (Web Fallback)
- `tel:` link for call initiation
- Simulated `ended` event on window focus return
- CallOutcomeSheet appears after simulated end

## Test Identifiers Checklist (All Slices)

### Slice 1: contacts/contact-directory
- [ ] contact-list
- [ ] contact-search-input
- [ ] contact-row-{contactId}
- [ ] contact-list-empty-state
- [ ] contact-detail
- [ ] contact-detail-name
- [ ] contact-detail-jobs-list
- [ ] contact-notes-list
- [ ] contact-note-item-{noteId}
- [ ] contact-call-button
- [ ] call-outcome-sheet
- [ ] call-outcome-note-input
- [ ] call-outcome-save-button
- [ ] call-outcome-dismiss-button

### Slice 2: jobs/job-list
- [ ] job-list-view
- [ ] job-table (desktop)
- [ ] job-card-list (mobile)
- [ ] job-status-filter
- [ ] job-item-{jobId}
- [ ] job-list-empty-state
- [ ] job-detail
- [ ] job-detail-contact-card
- [ ] job-detail-wo-list
- [ ] job-wo-item-{workOrderId}
- [ ] wo-create-button
- [ ] wo-create-sheet
- [ ] wo-create-title-input
- [ ] wo-create-assignee-select
- [ ] wo-create-date-input
- [ ] wo-create-submit-button
- [ ] wo-create-cancel-button
- [ ] wo-create-error-title
- [ ] wo-create-error-date
- [ ] wo-create-error-assignee

### Slice 3: work-orders/execute-work-order
- [ ] my-wo-list
- [ ] my-wo-today-group
- [ ] my-wo-upcoming-group
- [ ] wo-item-{workOrderId}
- [ ] wo-detail
- [ ] wo-detail-status-badge
- [ ] wo-status-advance-button
- [ ] wo-block-button
- [ ] wo-block-reason-input
- [ ] wo-block-confirm-button
- [ ] wo-block-reason-display
- [ ] wo-resume-button
- [ ] wo-add-photo-button
- [ ] wo-photo-grid
- [ ] wo-photo-thumb-{photoId}
- [ ] camera-permission-explainer

### Slice 4: platform/offline-outbox
- [ ] offline-indicator
- [ ] outbox-indicator
- [ ] outbox-panel
- [ ] outbox-item-{index}
- [ ] outbox-item-state
- [ ] outbox-retry-button-{index}

### Slice 5: platform/assignment-push
- [ ] push-inapp-banner
- [ ] wo-not-found-screen
- [ ] wo-not-found-back-button
- [ ] notif-permission-hint

## Acceptance Criteria
- All FRD scenarios pass (manual verification via test IDs)
- Mobile-first responsive: cards <768px, table ≥768px
- All mutations return envelope + surface feedback
- Offline: cached reads work, writes queue, replay on reconnect
- Push: in-app banner on foreground, deep link works
- Vitest suite green (outbox, status transitions, query/mutation hooks, web call fallback)
- pnpm lint && tsc --noEmit pass

## Out of Scope for Web UI
- Native Capacitor plugin (call-monitor) - native only
- Camera plugin - native only (web shows permission explainer)
- Background push notifications - native only
- Cold-start deep link - native only
- Secure token storage - native only
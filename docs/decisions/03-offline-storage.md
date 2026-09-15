# ADR 003: Offline Storage - IndexedDB + Outbox + Network Plugin

## Status
Accepted

## Context
The app must work offline for field workers. Data mutations (status changes, call outcomes, photos) need to be queued when offline and replayed when connectivity returns. Storage options considered:

1. **localStorage + manual queue** - Simple but limited (5MB, synchronous, no transactions)
2. **IndexedDB (idb) + Outbox Pattern** - Async, transactional, supports large data, indexed queries
3. **SQLite (via Capacitor SQLite)** - Full SQL, but adds native dependency, larger bundle
4. **OPFS (Origin Private File System)** - Modern but browser support varies

## Decision
Use **IndexedDB (via `idb` library) with Outbox Pattern** for offline storage.

## Rationale
- **Native web API** - No native dependencies, works in browser and Capacitor WebView
- **Transactional** - Atomic operations, no partial writes
- **Scalable** - Handles hundreds of outbox items efficiently
- **Indexed queries** - Fast lookups by type, state, timestamp
- **Capacitor compatible** - Works in iOS WebView and Android WebView
- **Outbox pattern** - Proven pattern for offline-first apps

## Architecture
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Mutations  │────▶│   Outbox    │────▶│  Replay     │
│  (UI)       │     │  (IndexedDB)│     │  (Sync)     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  Network    │
                    │  Plugin     │
                    │  Listener   │
                    └─────────────┘
```

## Data Model
```typescript
interface OutboxItem {
  id: string;           // UUID
  type: string;         // 'status_change' | 'call_outcome' | 'create'
  payload: unknown;     // Mutation input
  state: 'pending' | 'syncing' | 'synced' | 'failed';
  createdAt: string;    // ISO timestamp
  retriedAt?: string;
  error?: string;
}
```

## Network Detection
- **Native**: `@capacitor/network` - `Network.addListener('networkStatusChange')`
- **Web**: `navigator.onLine` + `window.online/offline` events
- Unified in `useOnlineStatus` hook

## Replay Logic
- Triggered on: app start, network online, manual retry
- Processes pending items in FIFO order
- Updates state: `pending` → `syncing` → `synced` | `failed`
- Exponential backoff for failed items (future)

## Consequences
- **Client-side only** - Works with static export (no server actions)
- **Storage quota** - Browser limits apply (~50MB typical)
- **Conflict resolution** - Last-write-wins (simple, acceptable for this domain)
- **No background sync** - Requires app open to replay (iOS restriction)

## Implementation
- `src/features/offline/lib/outbox-store.ts` - idb wrapper with indexes
- `src/features/offline/lib/sync-engine.ts` - Replay logic with mutation map
- `src/features/offline/hooks/use-online-status.hook.ts` - Network detection
- `src/features/offline/components/OutboxIndicator.tsx` - UI badge

## Related
- ADR 004: Bundled Static Export (offline storage works with static export)
- ADR 001: Local Notifications (work offline too)
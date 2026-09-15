# FRD Deviations

This document tracks deviations from the original Functional Requirements Document (FRD).

## Deviations

| ID | FRD Section | Deviation | Rationale | Impact |
|----|-------------|-----------|-----------|--------|
| DEV-001 | Offline Architecture | Used IndexedDB instead of Service Worker + Cache API | Simpler implementation, works with static export, sufficient for data mutations | No background sync, requires app open for replay |
| DEV-002 | Push Notifications | Local Notifications instead of FCM/APNs | No backend infrastructure needed, works offline | No remote push from dispatch center |
| DEV-003 | Call Monitoring | iOS-only (CXCallObserver), web fallback for Android | FRD didn't specify Android; assessment requested iOS Swift | Android users get simulated call flow |
| DEV-004 | Server Actions | Replaced with client-actions.ts + dataStore | Required for static export (`output: 'export'`) | No server-side validation, all client-side |
| DEV-005 | Static Export | `output: 'export'` instead of SSR | Required for Capacitor bundled shell | No dynamic routes without `generateStaticParams` |
| DEV-006 | Authentication | Single user (Casey Rivera), no auth | FRD scope focused on field operations, not auth | No multi-user support |
| DEV-007 | Android Native | Platform added but no native Camera/Call Monitor | Timeline constraints; iOS prioritized per assessment | Android uses web fallbacks |
| DEV-008 | Background Sync | Not implemented | iOS doesn't support background sync for PWAs | Requires app foreground for outbox replay |
| DEV-009 | Camera on Web | File input with `capture="environment"` | Native Camera plugin unavailable on web | No camera controls (zoom, flash) on web |
| DEV-010 | Seed Data | In-memory store reset on build | Static export bakes seed data into HTML | No persistent server database |

## Accepted Trade-offs

1. **Offline-first > Real-time sync**: Local mutations queue and replay; eventual consistency acceptable for field work
2. **Simplicity > Features**: Local Notifications over FCM eliminates backend complexity
3. **iOS First > Cross-platform**: Assessment specified iOS Swift; Android web fallback acceptable for MVP
4. **Static Export > SSR**: Capacitor requires bundled assets; SSR incompatible with native shell

## Future Considerations

- Add Android native Camera/Call Monitor plugins
- Implement Service Worker for asset caching
- Add FCM/APNs for true push from dispatch
- Background sync via periodic background fetch (iOS 15+)
- Multi-user authentication
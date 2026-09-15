# LIMITATIONS

## What's Cut / Not Implemented

| Feature | Status | Reason |
|---------|--------|--------|
| Android Native Camera | ❌ Not implemented | Timeline; iOS prioritized per assessment |
| Android Native Call Monitor | ❌ Not implemented | Timeline; iOS prioritized per assessment |
| Background Sync / Periodic Fetch | ❌ Not implemented | iOS restriction; requires app foreground |
| Service Worker / Asset Caching | ❌ Not implemented | Static export + Capacitor bundle handles assets |
| FCM / APNs Push | ❌ Not implemented | No backend; Local Notifications used instead |
| Multi-user / Authentication | ❌ Not implemented | FRD scope: single field worker |
| Photo Editing / Annotations | ❌ Not implemented | FRD: capture only |
| Voice Notes | ❌ Not implemented | Not in FRD |
| GPS Location Auto-capture | ❌ Not implemented | Not in FRD |
| Offline Map Tiles | ❌ Not implemented | Not in FRD |
| Dark Mode Toggle | ❌ Not implemented | System preference only |
| Settings Screen | ❌ Not implemented | Not in FRD |
| Export / Reporting | ❌ Not implemented | Not in FRD |

## What's Broken / Known Issues

| Issue | Severity | Workaround |
|-------|----------|------------|
| iOS: Simulator keyboard doesn't dismiss on scroll | Low | Tap outside input |
| Web: `viewport-fit=cover` may cause content under notch | Medium | SafeArea utilities handle it |
| Android: `cap sync` copies but no native Camera | High | Web fallback works |
| Static export: All `generateStaticParams` required | Medium | All dynamic routes have it |
| CallMonitor web: `window.focus` simulation timing | Low | 1s delay acceptable |
| Outbox: No exponential backoff retry | Medium | Manual retry available |
| No migration path for IndexedDB schema changes | Low | Dev only; clear storage if needed |

## Technical Debt

| Area | Debt | Effort to Fix |
|------|------|---------------|
| Replace `client-actions.ts` with Server Actions when SSR supported | Medium | Requires Next.js + Capacitor hybrid approach |
| Android native Camera plugin | Medium | 1-2 days |
| Android native Call Monitor plugin | High | 2-3 days (TelephonyManager complexity) |
| Add exponential backoff to outbox retry | Low | 2-4 hours |
| Service Worker for asset caching | Medium | 4-8 hours |
| Unit test coverage < 80% | Medium | Ongoing |
| E2E tests (Playwright) | Medium | 1-2 days |

## Next 8-Hour Plan

### Hour 1-2: Documentation Polish
- [ ] Complete README (mobile commands, troubleshooting)
- [ ] Add troubleshooting section for common iOS/Android issues
- [ ] Document seed data reset procedure

### Hour 3-4: Android Native Camera
- [ ] Create Camera plugin Android implementation (Kotlin)
- [ ] Add to Capacitor config
- [ ] Test on Android emulator

### Hour 5-6: Outbox Improvements
- [ ] Add exponential backoff retry logic
- [ ] Add max retry count
- [ ] Add retry timestamp display

### Hour 7-8: Polish & Demo Prep
- [ ] Record 5-min demo video (simulator + device)
- [ ] Create GitHub Actions CI (lint, typecheck, test, build)
- [ ] Final README review
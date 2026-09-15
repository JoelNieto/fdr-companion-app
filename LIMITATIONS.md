# LIMITATIONS

## What's Cut / Not Implemented

| Feature | Status | Reason |
|---------|--------|--------|
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
| .NET backend PLUS | ❌ Not implemented | Timebox; MUSTs prioritized |
| Playwright E2E PLUS | ❌ Not implemented | Timebox |

## What's Broken / Known Issues

| Issue | Severity | Workaround |
|-------|----------|------------|
| iOS: Simulator keyboard doesn't dismiss on scroll | Low | Tap outside input |
| Android: Camera works via Capacitor Camera plugin after Info.plist/Manifest sync; Call Monitor uses web fallback | Medium | Use iOS for full call flow |
| Static export: All `generateStaticParams` required | Medium | All dynamic routes have it |
| CallMonitor web: `window.focus` simulation timing | Low | 1s delay acceptable |
| Outbox: No exponential backoff retry | Medium | Manual retry available |
| No migration path for IndexedDB / localStorage schema changes | Low | `pnpm seed` / clear `field-companion-data` |
| Stale localStorage after seed updates | Medium | Reset seed (see README) before reviewing fixtures |

## Demo

Screen recording: [`companion-app-demo.mov`](./companion-app-demo.mov) (~8MB, compressed from original capture). Covers emulator run-through, offline outbox cycle, call-outcome flow, and push deep link.

## Technical Debt

| Area | Debt | Effort to Fix |
|------|------|---------------|
| Replace `client-actions.ts` with Server Actions when SSR supported | Medium | Requires Next.js + Capacitor hybrid approach |
| Android native Call Monitor plugin | High | 2-3 days (TelephonyManager complexity) |
| Add exponential backoff to outbox retry | Low | 2-4 hours |
| Service Worker for asset caching | Medium | 4-8 hours |
| E2E tests (Playwright) | Medium | 1-2 days |

## Next 8-Hour Plan

### Hour 1-2: Submission polish
- [x] Demo video recorded and linked
- [x] README fixture map + `pnpm test` / `pnpm seed`
- [ ] Private GitHub repo + reviewer invites (or zip with `.git`)

### Hour 3-4: Android Call Monitor
- [ ] Kotlin TelephonyCallback implementation
- [ ] Wire into Capacitor plugin + permissions

### Hour 5-6: Outbox Improvements
- [ ] Exponential backoff retry logic
- [ ] Max retry count + timestamp display

### Hour 7-8: Hardening
- [ ] Push cold-start deep link (PLUS)
- [ ] Playwright smoke of 2–3 FRD scenarios

# Capacitor Mobile Layer Implementation Plan

## Overview
Add Capacitor 8 mobile shell with custom `call-monitor` plugin (iOS Swift), Local Notifications for push, Camera plugin, Network plugin, and bundled static export strategy.

## Decisions (from user)
- **Native Platform**: iOS (Swift) with `CXCallObserver`
- **Push Transport**: Local Notifications (Capacitor Local Notifications plugin)
- **Shell Strategy**: Bundled Static Export (production-like)
- **Custom Plugin**: `call-monitor` (local, not published)

---

## Task List

### 1. Capacitor Setup & Configuration
- [x] Install Capacitor 8 core + CLI + iOS + Android
- [x] Initialize Capacitor project (`npx cap init`)
- [x] Add iOS platform (`npx cap add ios`)
- [x] Add Android platform (`npx cap add android`) - for future
- [x] Configure `capacitor.config.ts`:
  - `webDir: 'out'` (static export)
  - `server: { url: 'http://localhost:3000', cleartext: true }` (dev fallback)
  - `ios: { scheme: 'fieldcompanion' }` (deep linking)
  - `plugins` config for Camera, Network, LocalNotifications, SecureStorage
- [x] Add Capacitor scripts to `package.json`:
  - `cap:sync` → `npx cap sync`
  - `cap:ios` → `npx cap open ios` (or `npx cap run ios`)
  - `cap:android` → `npx cap run android`
  - `cap:build` → `npx cap build ios`
  - `build:mobile` → `next build && npx cap sync`

### 2. Next.js Static Export Configuration
- [x] Update `next.config.ts` for static export:
  - `output: 'export'`
  - `images: { unoptimized: true }`
  - `trailingSlash: true`
- [x] Update `capacitor.config.ts` to point to `out/` directory
- [x] Verify build works: `pnpm build && npx cap sync`

### 3. Custom Local Plugin: `call-monitor` (iOS Swift)
- [x] Create plugin structure in `plugins/call-monitor/`:
  - `call-monitor.podspec`
  - `src/ios/CallMonitorPlugin.swift`
  - `src/ios/CallMonitorPlugin.m` (if needed)
  - `src/web.ts` (web fallback)
  - `definitions.ts` (TypeScript types)
  - `package.json`
  - `capacitor.config.json` (plugin config)
- [x] **Swift Implementation** (`CallMonitorPlugin.swift`):
  - Use `CXCallObserver` to monitor call state
  - Methods: `startCall(phoneNumber: String)`, `addListener('callState', ...)`
  - Events: `started`, `ended`, `failed`
  - Permission: `NSUserActivityTypePhone` in Info.plist
- [x] **TypeScript API** (`definitions.ts`):
  ```typescript
  export interface CallMonitorPlugin {
    startCall(options: { phoneNumber: string }): Promise<void>;
    addListener(event: 'callState', callback: (state: CallState) => void): Promise<CallbackID>;
    removeAllListeners(): Promise<void>;
  }
  export type CallState = { state: 'started' | 'ended' | 'failed'; phoneNumber?: string };
  ```
- [x] **Web Fallback** (`src/web.ts`):
  - `startCall` → `window.location.href = 'tel:' + phoneNumber`
  - Simulated `ended` event on `window.focus` after 1s delay
  - Same TypeScript API
- [x] Register plugin in `capacitor.config.ts` → `plugins: { CallMonitor: { ios: { ... } } }`
- [x] Add to iOS `Info.plist`:
  - `NSUserActivityTypePhone` for call capability
  - `UIBackgroundModes` with `voip` if needed

### 4. Official Capacitor Plugins Integration

#### 4.1 Network Plugin (`@capacitor/network`)
- [x] Install: `pnpm add @capacitor/network`
- [x] Replace web `navigator.onLine` with `Network.addListener('networkStatusChange', ...)`
- [x] Update `useOnlineStatus` hook to use Capacitor Network on native
- [x] Keep web fallback using `navigator.onLine`

#### 4.2 Camera Plugin (`@capacitor/camera`)
- [x] Install: `pnpm add @capacitor/camera`
- [x] Replace web file input with `Camera.getPhoto({ quality: 90, allowEditing: false, resultType: CameraResultType.DataUrl })`
- [x] Handle permission denied path (show permission explainer)
- [x] Update `PhotoGrid` and `WorkOrderDetail` to use Camera plugin on native

#### 4.3 Local Notifications Plugin (`@capacitor/local-notifications`)
- [x] Install: `pnpm add @capacitor/local-notifications`
- [x] Implement assignment notification:
  - Schedule local notification on work order creation/assignment
  - Handle `localNotificationActionPerformed` for deep link
  - Deep link: `fieldcompanion://work-orders/{id}`
- [x] Update `PushProvider` to use Local Notifications on native
- [x] Permission handling: request on app start, show hint if denied

#### 4.4 Secure Storage Plugin (`@capacitor/secure-storage`) - PLUS
- [ ] Install: `pnpm add @capacitor/secure-storage`
- [ ] Create store abstraction (interface + native/web implementations)
- [ ] Use for any tokens/secrets (future-proofing)

### 5. Integration & Hook Updates

- [x] Update `useOnlineStatus` hook → use Network plugin on native
- [ ] Update `useCallOutcome` → integrate `CallMonitor` plugin for native call flow
- [x] Update camera logic in `WorkOrderDetail` → use Camera plugin
- [x] Update `PushProvider` → use Local Notifications on native
- [x] Add deep link handler in `app/layout.tsx` for `fieldcompanion://` URLs

### 6. iOS Project Configuration
- [ ] Open `ios/App/App.xcworkspace` in Xcode
- [ ] Configure signing (automatic for simulator)
- [ ] Add `CallMonitor` plugin to Xcode project (auto via `cap sync`)
- [ ] Verify `Info.plist` has required permissions
- [ ] Test build: `npx cap run ios` (simulator)

### 7. Android Project (Minimal - for future)
- [x] Add Android platform: `npx cap add android`
- [ ] Configure `android/` project (minimal - no native impl yet)
- [x] Verify `cap sync` works for both platforms

### 8. ADRs (Decision Records)
- [ ] `docs/decisions/01-push-transport.md` → Local Notifications
- [ ] `docs/decisions/02-custom-plugin-scope.md` → call-monitor iOS-only
- [ ] `docs/decisions/03-offline-storage.md` → IndexedDB + outbox + Network plugin
- [ ] `docs/decisions/04-shell-strategy.md` → Bundled Static Export

### 9. PROMPTS.md Auto-Capture Mechanism
- [ ] Create `.claude/hooks/pre-prompt.sh` or similar hook
- [ ] Capture: timestamp, tool+model, verbatim prompt
- [ ] Commit mechanism with the work (not separate commit)
- [ ] Document in README

### 10. Testing (Vitest)
- [ ] Test outbox logic (enqueue → replay → failure → retry)
- [ ] Test work order status transitions (legal/illegal)
- [ ] Test query hook + mutation hook via `renderHook`
- [ ] Test `call-monitor` web fallback
- [ ] Add tests for Local Notifications scheduling

### 10. Documentation
- [ ] Update `README.md`:
  - Prerequisites table (Node, pnpm, Xcode, Android Studio versions)
  - Setup steps (clone → install → cap sync → run)
  - All run commands (`dev`, `cap:sync`, `cap:ios`, `cap:android`, `test`, `seed`)
  - Seed data + FRD fixture access instructions
- [ ] `docs/frd-deviations.md` - any cuts/deviations
- [ ] `LIMITATIONS.md` - what's cut, what's broken, next 8-hour plan
- [ ] `TIMELOG.md` - update with mobile phase

### 11. Demo Video (≤ 5 min)
- [ ] Record: emulator run-through
- [ ] Record: offline outbox cycle (kill network → mutate → restore → replay)
- [ ] Record: call-outcome flow
- [ ] Record: push deep link
- [ ] Upload as unlisted YouTube or include in repo

### 12. CI/CD (PLUS)
- [ ] GitHub Actions: lint + typecheck + test
- [ ] iOS build on macOS runner (optional)

---

## Validation Checklist

| Requirement | Verification |
|-------------|--------------|
| Capacitor 8 + iOS/Android projects committed | `git ls-files ios/ android/` |
| `call-monitor` plugin local, Swift implementation | `plugins/call-monitor/src/ios/` |
| Web fallback for call-monitor | `plugins/call-monitor/src/web.ts` |
| Network plugin for offline detection | `useOnlineStatus` uses Network plugin |
| Camera plugin for photo capture | `WorkOrderDetail` uses Camera plugin |
| Local Notifications for push | `PushProvider` uses LocalNotifications |
| Deep link handling | `fieldcompanion://work-orders/{id}` works |
| Static export builds | `pnpm build` produces `out/` |
| Capacitor scripts work | `pnpm cap:sync`, `pnpm cap:ios` |
| Vitest suite passes | `pnpm test` |
| ADRs in `docs/decisions/` | 4 files present |
| PROMPTS.md auto-capture | Hook script committed |
| README complete | All sections filled |

---

## Open Questions (None - all resolved)

All key decisions resolved via user answers.

---

## Dependencies to Add

| Package | Purpose | Version Pin |
|---------|---------|-------------|
| `@capacitor/core` | Core runtime | ^8.0.0 |
| `@capacitor/cli` | CLI tools | ^8.0.0 |
| `@capacitor/ios` | iOS platform | ^8.0.0 |
| `@capacitor/android` | Android platform | ^8.0.0 |
| `@capacitor/network` | Connectivity detection | ^8.0.0 |
| `@capacitor/camera` | Photo capture | ^8.0.0 |
| `@capacitor/local-notifications` | Push notifications | ^8.0.0 |
| `@capacitor/secure-storage` | Secure token storage | ^8.0.0 |

---

## Estimated Scope (Timebox: 12 hours total, ~6.5h spent on web)

Remaining ~5.5 hours for mobile layer:
- Capacitor setup + static export: ~45 min
- call-monitor plugin (Swift + TS): ~2 hours
- Official plugins integration: ~1.5 hours
- Hook updates + deep links: ~45 min
- iOS build/test: ~45 min
- ADRs + docs + README: ~45 min
- Demo video: ~15 min
# ADR 002: Custom Plugin Scope - call-monitor iOS-Only

## Status
Accepted

## Context
The app needs to track phone call outcomes (started, ended, failed) for contact calls. Options considered:
1. **Web-only** - Use `tel:` links, simulate ended on window focus (limited accuracy)
2. **Cross-platform plugin** - iOS (CXCallObserver) + Android (TelephonyManager/PhoneStateListener)
3. **iOS-only plugin** - Native Swift using CXCallObserver, web fallback for Android

## Decision
Implement **call-monitor as iOS-only native plugin** with web fallback for Android.

## Rationale
- **iOS has robust API** - CXCallObserver provides reliable call state (started, connected, ended, failed)
- **Android API complexity** - Requires runtime permissions, foreground service, varies by Android version
- **Assessment requirement** - iOS Swift implementation specifically requested
- **Web fallback acceptable** - Android can use `tel:` link + focus simulation (good enough for MVP)
- **Faster delivery** - Single platform implementation meets timeline

## Consequences
- **Android users** get web fallback behavior (simulated ended event)
- **iOS users** get accurate call state monitoring
- **Future work** - Android native implementation needed for parity
- **Plugin architecture** supports multi-platform - easy to add Android later

## Implementation
- Swift plugin: `plugins/call-monitor/src/ios/CallMonitorPlugin.swift`
- Uses `CXCallObserver` delegate for call state changes
- TypeScript API in `definitions.ts` with `CallState` type
- Web fallback in `src/web.ts` using `tel:` + `window.focus` simulation
- Registered in `capacitor.config.ts` and iOS `Info.plist` (`NSUserActivityTypePhone`)

## Related
- ADR 003: Offline Storage (call outcomes use outbox when offline)
- ContactDetail component uses `useCallOutcome.startCall()`
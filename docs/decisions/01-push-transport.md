# ADR 001: Push Transport - Local Notifications

## Status
Accepted

## Context
The Field Companion app needs push notifications for work order assignments. The decision was between:
1. **Firebase Cloud Messaging (FCM)** - Full push infrastructure, requires server setup, token management
2. **Apple Push Notification Service (APNs)** - iOS only, requires certificates, server setup
3. **Capacitor Local Notifications** - Device-only scheduling, no server required, works offline

## Decision
Use **Capacitor Local Notifications** plugin for push transport.

## Rationale
- **No backend infrastructure** needed - notifications scheduled entirely on device
- **Works offline** - critical for field workers with spotty connectivity
- **Cross-platform** - iOS and Android support via single API
- **Simpler implementation** - no token registration, no server-side logic
- **Meets requirements** - assignment notifications fire when work order created locally

## Consequences
- **No remote push** - cannot send notifications from server (e.g., dispatch center)
- **No delivery guarantees** - local only, no retry if app killed
- **Limited payload** - no rich media, just title/body/data
- **User must grant permission** - handled in PushProvider with hint UI

## Implementation
- Schedule notification on work order creation via `scheduleAssignmentNotification()`
- Handle tap via `localNotificationActionPerformed` listener
- Deep link: `fieldcompanion://work-orders/{id}`
- Permission requested on app start, with hint if denied

## Related
- ADR 004: Bundled Static Export (local notifications work with static export)
- PushProvider component in `src/features/push/components/PushProvider.tsx`
# FRD Deviations

## Overview
This document tracks intentional deviations from the Field Companion FRD (Functional Requirements Document) due to platform constraints, scope decisions, or technical trade-offs.

## Deviations by Slice

### Slice 1: contacts/contact-directory
| FRD Requirement | Deviation | Reason |
|-----------------|-----------|--------|
| Native call monitor plugin | Web uses `tel:` + simulated `ended` | Capacitor plugin not available on web |
| Native contact sync | Read-only contacts from seed data | Web cannot access native contacts |
| Secure token storage | Not implemented | Web-only scope |

### Slice 2: jobs/job-list
| FRD Requirement | Deviation | Reason |
|-----------------|-----------|--------|
| Offline job creation | Only work order creation queued | Jobs are read-only in FRD |
| Background sync indicator | Simplified to outbox indicator | Web Service Worker not implemented |

### Slice 3: work-orders/execute-work-order
| FRD Requirement | Deviation | Reason |
|-----------------|-----------|--------|
| Camera plugin for photos | File input + blob URL | Capacitor Camera not available on web |
| Photo compression/EXIF | Not implemented | Web scope limitation |
| Background location | Not implemented | Web scope limitation |

### Slice 4: platform/offline-outbox
| FRD Requirement | Deviation | Reason |
|-----------------|-----------|--------|
| Service Worker caching | Not implemented | Complexity for demo scope |
| Background sync API | Not implemented | Web scope limitation |
| Conflict resolution | Last-write-wins only | Simplified for demo |

### Slice 5: platform/assignment-push
| FRD Requirement | Deviation | Reason |
|-----------------|-----------|--------|
| FCM background push | localStorage polling simulation | Web push requires VAPID + backend |
| Cold-start deep link | Not implemented | Requires native app |
| Badge count | Not implemented | Web scope limitation |
| Notification permission hint | Single non-nagging hint | Per FRD |

## Cross-Cutting

### Not Implemented (Native Only)
- Secure token storage (Keychain/Keystore)
- Biometric auth
- Background geofencing
- Background location tracking
- Native contact picker
- File system access (scoped storage)

### Simplified for Web Demo
- Seed data replaces real API
- In-memory data store with IndexedDB for outbox
- localStorage for push simulation
- No authentication/authorization
- Single user (Casey Rivera)

## Accepted Trade-offs
1. **No Service Worker**: Added complexity for marginal demo benefit
2. **Simplified Push**: localStorage polling is sufficient for demo
3. **No Background Sync API**: Manual replay on reconnect is clear UX
4. **No Photo Compression**: Blob URLs work for demo evidence
5. **Single User**: Focus on core workflow, not multi-user
# Prompts & Templates

## Session Prompts (Chronological)

### 1. Initial Implementation Plan
> "With the plan on plans/frd-field-companion.md, lets start the implementation plan. Lets focus first only on web UI. Mobile first using Tailwind utilities"

### 2. Layout Direction
> "Lets start with Phase 1. Let's use bottom navigation for the layout"

### 3. Continue Implementation
> "Implement the plan above."
> "Continue"
> "Continue with Phase 2"

### 4. UI Adjustments
> "Lets make the search input on src/features/contacts/components/ContactList.tsx sticky so it doesn't hide while scrolling"

### 5. Phase 3
> "Lets continue with Phase 3"

### 6. Scroll Fix
> "Lets fix src/features/jobs/components/JobList.tsx scroll safe area so there is no items hidden behind the navigation bar"

### 7. Phase 4
> "Continue with Phase 4"

### 8. Offline Testing
> "How to test offline outbox?"
> "Right, the outboxx is not being shown at the bottom navigation, only the yellow 'Your offline...' indicator"
> "I:
> - when to a Job detail page
> - Toggled to Offline
> - Tried to add a new Work order
> -- Submit button stuck on 'Creating...'
> -- No Outbox indicator changes
> Not expected behaviour"

### 9. Offline Indicator Position
> "Lets rollback the outbox indicator to the float above the navigator and maintain just 3 icons there"

### 10. Offline Behavior
> "The test is unsuccesfull. There is no behaviour difference between offline and online, when running with pnpm dev. Using pnpm build && pnpm start maintain the all 'Stuck in creating without outbox indicator'"

### 11. Phase 6
> "resume with Phase 5"
> "I'm getting Runtime TypeError Server Cannot destructure property 'id' of '(intermediate value)' as it is undefined."

### 12. Not Found Page
> "Introducing an invalid work order id just show 'Work order not found', not the new not found page"

### 13. Work Order List Refresh
> "If I create a work order assigned to Casey Rivera, it doesn't show in the work orders list"

### 14. Phase 7 & Documentation
> "Continue with Phase 7"
> "In the PROMPTS.MD file, list the propmpts I have been giving to you through this session"

---

## Agent Prompts for Common Tasks

### New Feature Development
```
Implement [feature name] following the FRD slice pattern:
1. Types & Zod schema in src/features/[feature]/schema/
2. Server actions in src/features/[feature]/server/actions.ts
3. TanStack Query hooks in src/features/[feature]/hooks/
4. Components in src/features/[feature]/components/
5. Pages in app/[feature]/
6. Test IDs per FRD requirements
```

### Bug Fix
```
Fix [issue description]:
1. Reproduce with test case
2. Identify root cause
3. Minimal fix
4. Verify with existing tests
5. Run lint & typecheck
```

### Refactor
```
Refactor [component/hook] to:
1. Follow existing patterns
2. Maintain test IDs
3. Update related files
4. Run build & lint
```

## Code Review Checklist
- [ ] All mutations return envelope + surface feedback
- [ ] No direct `useQuery`/`useMutation` in components
- [ ] Zod validation at server boundaries
- [ ] Test IDs match FRD requirements
- [ ] Mobile-first responsive (cards <768px, table ≥768px)
- [ ] Offline: cached reads work, writes queue, replay on reconnect
- [ ] Push: in-app banner on foreground, deep link works
- [ ] Vitest suite green (outbox, status transitions, hooks, call fallback)
- [ ] `pnpm lint && tsc --noEmit` pass## 2026-09-14T14:40:45.378Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Set up Capacitor 8 with iOS and Android platforms
```

## 2026-09-14T14:50:54.854Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Initialize Capacitor 8 project with iOS and Android platforms
```

## 2026-09-14T14:51:29.638Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Configure next.config.ts for static export with output: export, images.unoptimized: true, trailingSlash: true
```

## 2026-09-14T14:51:50.613Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Create call-monitor custom Capacitor plugin with Swift implementation using CXCallObserver for iOS call state monitoring (started, ended, failed events)
```

## 2026-09-14T14:52:17.514Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Implement web fallback for call-monitor plugin using tel: links and window.focus simulation for ended event
```

## 2026-09-14T14:52:46.690Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Add NSUserActivityTypePhone to iOS Info.plist for call capability and register call-monitor plugin in capacitor.config.ts
```

## 2026-09-14T14:52:55.879Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Integrate @capacitor/network plugin into useOnlineStatus hook with native Network.addListener and web navigator.onLine fallback
```

## 2026-09-14T14:53:06.373Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Integrate @capacitor/camera plugin into WorkOrderDetail using Camera.getPhoto with quality: 90, DataUrl result type, and CameraSource.Camera on native; web fallback with file input
```

## 2026-09-14T14:53:13.623Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Add NSCameraUsageDescription to iOS Info.plist and update CameraPermissionExplainer with platform-specific guidance
```

## 2026-09-14T14:53:35.115Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Integrate @capacitor/local-notifications for push: schedule assignment notification on work order creation, handle localNotificationActionPerformed for deep link fieldcompanion://work-orders/{id}
```

## 2026-09-14T14:54:15.046Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Update PushProvider to use LocalNotifications on native with permission request, update useCreateWorkOrder to schedule notification, add deep link handler in LayoutClient using @capacitor/app
```

## 2026-09-14T14:54:59.397Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Add CFBundleURLTypes to iOS Info.plist and intent-filter to Android AndroidManifest.xml for fieldcompanion:// deep link scheme
```

## 2026-09-14T14:56:22.035Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Install @capacitor/preferences for secure storage abstraction; create SecureStore interface with NativeSecureStore (Preferences) and WebSecureStore (localStorage) implementations
```

## 2026-09-14T14:56:54.530Z

**Tool/Model:** kilo:nemotron-3-ultra

**Prompt:**
```
Create PROMPTS.md auto-capture mechanism with .kilo/hooks/capture-prompt.js and .sh wrapper capturing timestamp, tool+model, verbatim prompt; commit with work
```

